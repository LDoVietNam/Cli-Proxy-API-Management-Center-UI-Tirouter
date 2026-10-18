import { apiClient } from './client';

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';

export interface TaskboardTask {
  id: string;
  plan_id?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: number; // 1=high, 2=medium, 3=low
  assignee?: string;
  reporter?: string;
  tags?: string[];
  dependencies?: string[];
  progress?: number; // 0-100
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

export type TaskBoard = Record<TaskStatus, TaskboardTask[]>;

export interface TaskboardBoardResponse {
  board: TaskBoard;
}

export interface TaskTemplate {
  name: string;
  description: string;
  columns?: TaskStatus[];
  title: string;
  type: string;
  priority: number;
  assignee: string;
  tags: string[];
  defaults?: Record<string, string>;
}

export interface TaskboardTemplatesResponse {
  templates: TaskTemplate[];
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: number;
  assignee?: string;
  reporter?: string;
  tags?: string[];
  dependencies?: string[];
  plan_id?: string;
  metadata?: Record<string, unknown>;
}

export const TASK_STATUSES: TaskStatus[] = [
  'backlog',
  'todo',
  'in_progress',
  'review',
  'done',
  'blocked',
];

export interface AgentPlanTaskNode {
  id: string;
  title: string;
  description: string;
  type: 'coding' | 'review' | 'research' | 'deploy';
  priority: number;
  assignee: string;
  depends_on: string[];
  status: string;
}

export interface AgentPlan {
  id: string;
  goal: string;
  description: string;
  tasks: AgentPlanTaskNode[];
  dependencies: Record<string, string[]>;
  created_at: string;
  updated_at: string;
  status: string;
}

export const plansApi = {
  create: (goal: string, description = '') =>
    apiClient.post<AgentPlan>('/plans', { goal, description }),
  get: (id: string) => apiClient.get<AgentPlan>(`/plans/${encodeURIComponent(id)}`),
  execute: (id: string) =>
    apiClient.post<{ status: string }>(`/plans/${encodeURIComponent(id)}/execute`),
  cancel: (id: string) =>
    apiClient.post<{ status: string }>(`/plans/${encodeURIComponent(id)}/cancel`),
};

export const taskboardApi = {
  getBoard: () => apiClient.get<TaskboardBoardResponse>('/taskboard/board'),
  getTemplates: () => apiClient.get<TaskboardTemplatesResponse>('/taskboard/templates'),
  getTask: (id: string) => apiClient.get<TaskboardTask>(`/taskboard/tasks/${encodeURIComponent(id)}`),
  createTask: (payload: CreateTaskPayload) =>
    apiClient.post<TaskboardTask>('/taskboard/tasks', payload),
  updateTask: (id: string, payload: Partial<CreateTaskPayload>) =>
    apiClient.patch<TaskboardTask>(`/taskboard/tasks/${encodeURIComponent(id)}`, payload),
  moveTask: (id: string, status: TaskStatus) =>
    apiClient.post<TaskboardTask>(`/taskboard/tasks/${encodeURIComponent(id)}/move`, { status }),
  deleteTask: (id: string) =>
    apiClient.delete<{ deleted: string }>(`/taskboard/tasks/${encodeURIComponent(id)}`),
  startTimer: (id: string) =>
    apiClient.post<TaskboardTask>(`/taskboard/tasks/${encodeURIComponent(id)}/timer/start`),
  stopTimer: (id: string) =>
    apiClient.post<TaskboardTask>(`/taskboard/tasks/${encodeURIComponent(id)}/timer/stop`),
  blockTask: (id: string, reason: string) =>
    apiClient.post<TaskboardTask>(`/taskboard/tasks/${encodeURIComponent(id)}/block`, { reason }),
  unblockTask: (id: string) =>
    apiClient.post<TaskboardTask>(`/taskboard/tasks/${encodeURIComponent(id)}/unblock`),
  getSubtasks: (id: string) =>
    apiClient.get<{ subtasks: TaskboardTask[] }>(
      `/taskboard/tasks/${encodeURIComponent(id)}/subtasks`
    ),
  createSubtask: (id: string, payload: CreateTaskPayload) =>
    apiClient.post<TaskboardTask>(`/taskboard/tasks/${encodeURIComponent(id)}/subtasks`, payload),
  getMemoryContext: () => apiClient.get<{ context: string }>('/taskboard/memory-context'),
  undo: () => apiClient.post<{ message: string; undo_depth: number; redo_depth: number }>('/taskboard/undo'),
  redo: () => apiClient.post<{ message: string; undo_depth: number; redo_depth: number }>('/taskboard/redo'),
  getHistory: () => apiClient.get<{ undo_depth: number; redo_depth: number }>('/taskboard/history'),
};
