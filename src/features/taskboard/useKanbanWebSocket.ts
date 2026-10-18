import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores';
import type { TaskBoard, TaskStatus, TaskboardTask } from '@/services/api/taskboard';

// Server pushes board snapshots and task mutations through this socket.
// Browser WebSockets cannot set an Authorization header, so the server mounts
// this endpoint outside the management-key group.
const WS_PATH = '/v0/management/ws/taskboard';

export type KanbanSocketEvent =
  | { type: 'board.sync'; board: TaskBoard }
  | {
      type:
        | 'task.created'
        | 'task.updated'
        | 'task.moved'
        | 'task.deleted'
        | 'task.blocked'
        | 'task.unblocked'
        | 'task.timer_started'
        | 'task.timer_stopped'
        | 'task.restored';
      task?: TaskboardTask;
    };

interface UseKanbanWebSocketOptions {
  onEvent?: (event: KanbanSocketEvent) => void;
  onStatusChange?: (connected: boolean) => void;
  /** Milliseconds between automatic reconnects after an unexpected close. */
  reconnectDelay?: number;
}

/**
 * Subscribes to the taskboard WebSocket and reports board events. The caller
 * typically maps a `board.sync` snapshot onto local state and re-fetches on
 * mutation events (or applies optimistic updates directly).
 */
export function useKanbanWebSocket({
  onEvent,
  onStatusChange,
  reconnectDelay = 3000,
}: UseKanbanWebSocketOptions = {}) {
  const apiBase = useAuthStore((state) => state.apiBase);
  const managementKey = useAuthStore((state) => state.managementKey);
  const onEventRef = useRef(onEvent);
  const onStatusChangeRef = useRef(onStatusChange);

  // Latest-ref pattern: cập nhật ref trong effect, không gán trong render
  // (React Compiler cấm truy cập ref trong render phase).
  useEffect(() => {
    onEventRef.current = onEvent;
    onStatusChangeRef.current = onStatusChange;
  }, [onEvent, onStatusChange]);

  useEffect(() => {
    if (!apiBase) {
      return;
    }

    const base = apiBase.replace(/\/v0\/management\/?$/i, '').replace(/\/+$/, '');
    const url = base.replace(/^http/, 'ws') + WS_PATH + (managementKey ? `?key=${encodeURIComponent(managementKey)}` : '');

    let socket: WebSocket | null = null;
    let closedByCleanup = false;
    let reconnectTimer: number | undefined;

    const notify = (connected: boolean) => onStatusChangeRef.current?.(connected);

    const connect = () => {
      try {
        socket = new WebSocket(url);
      } catch {
        return;
      }

      socket.onopen = () => notify(true);

      socket.onmessage = (message) => {
        try {
          const parsed = JSON.parse(message.data as string) as KanbanSocketEvent;
          onEventRef.current?.(parsed);
        } catch {
          // Ignore non-JSON frames (e.g. pings).
        }
      };

      socket.onclose = () => {
        notify(false);
        if (!closedByCleanup) {
          reconnectTimer = window.setTimeout(connect, reconnectDelay);
        }
      };

      socket.onerror = () => {
        socket?.close();
      };
    };

    connect();

    return () => {
      closedByCleanup = true;
      if (reconnectTimer !== undefined) {
        window.clearTimeout(reconnectTimer);
      }
      socket?.close();
    };
  }, [apiBase, managementKey, reconnectDelay]);
}

/** Applies a board.sync snapshot (with column defaults) onto local state. */
export function mergeBoardSnapshot(current: TaskBoard, snapshot: Partial<TaskBoard> | undefined): TaskBoard {
  const statuses: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'review', 'done', 'blocked'];
  const merged: TaskBoard = { ...current };
  for (const status of statuses) {
    merged[status] = snapshot?.[status] ?? [];
  }
  return merged;
}
