import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  TASK_STATUSES,
  taskboardApi,
  type CreateTaskPayload,
  type TaskBoard,
  type TaskStatus,
  type TaskboardTask,
} from '@/services/api/taskboard';
import { mergeBoardSnapshot, useKanbanWebSocket } from './useKanbanWebSocket';
import {
  plansApi,
  type AgentPlan,
  type AgentPlanTaskNode,
  type TaskTemplate,
} from '@/services/api/taskboard';
import styles from './TaskboardPage.module.scss';

const STATUS_LABEL_KEY: Record<TaskStatus, string> = {
  backlog: 'taskboard.status_backlog',
  todo: 'taskboard.status_todo',
  in_progress: 'taskboard.status_in_progress',
  review: 'taskboard.status_review',
  done: 'taskboard.status_done',
  blocked: 'taskboard.status_blocked',
};

const PRIORITY_TONE: Record<number, 'High' | 'Medium' | 'Low'> = {
  1: 'High',
  2: 'Medium',
  3: 'Low',
};

const PRIORITY_NAME_KEY: Record<number, string> = {
  1: 'taskboard.priority_high',
  2: 'taskboard.priority_medium',
  3: 'taskboard.priority_low',
};

const COLUMN_CLASS: Record<TaskStatus, string> = {
  backlog: 'columnBacklog',
  todo: 'columnTodo',
  in_progress: 'columnInProgress',
  review: 'columnReview',
  done: 'columnDone',
  blocked: 'columnBlocked',
};

const PLAN_STATUS_CLASS: Record<string, string> = {
  pending: 'planStatusPending',
  created: 'planStatusCreated',
  in_progress: 'planStatusInProgress',
  cancelled: 'planStatusCancelled',
  failed: 'planStatusFailed',
};

const emptyBoard = (): TaskBoard => ({
  backlog: [],
  todo: [],
  in_progress: [],
  review: [],
  done: [],
  blocked: [],
});

/** Board rỗng hoàn toàn → hiển thị EmptyState thay vì 6 cột trống */
const isBoardEmpty = (board: TaskBoard): boolean =>
  TASK_STATUSES.every((status) => board[status].length === 0);

/** Cột liền kề để di chuyển task bằng bàn phím (giữ nguyên thứ tự hiển thị) */
const adjacentStatus = (status: TaskStatus, direction: -1 | 1): TaskStatus | null => {
  const index = TASK_STATUSES.indexOf(status);
  const next = TASK_STATUSES[index + direction];
  return next ?? null;
};

export function TaskboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [board, setBoard] = useState<TaskBoard>(emptyBoard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<TaskboardTask | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<TaskboardTask | null>(null);
  const [dragged, setDragged] = useState<TaskboardTask | null>(null);
  const [liveConnected, setLiveConnected] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [plan, setPlan] = useState<AgentPlan | null>(null);
  const [planGoal, setPlanGoal] = useState('');
  const [planBusy, setPlanBusy] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [memoryContext, setMemoryContext] = useState('');
  const [memoryLoading, setMemoryLoading] = useState(false);
  const [undoDepth, setUndoDepth] = useState(0);
  const [redoDepth, setRedoDepth] = useState(0);

  // Realtime sync: server pushes board snapshots + task mutations.
  useKanbanWebSocket({
    onStatusChange: setLiveConnected,
    onEvent: (event) => {
      if (event.type === 'board.sync' && event.board) {
        setBoard((current) => mergeBoardSnapshot(current, event.board));
        setLoading(false);
      } else if (
        event.type === 'task.created' ||
        event.type === 'task.updated' ||
        event.type === 'task.moved' ||
        event.type === 'task.deleted' ||
        event.type === 'task.blocked' ||
        event.type === 'task.unblocked' ||
        event.type === 'task.timer_started' ||
        event.type === 'task.timer_stopped' ||
        event.type === 'task.restored'
      ) {
        void refresh();
        void refreshHistory();
      }
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await taskboardApi.getBoard();
      const merged = emptyBoard();
      for (const status of TASK_STATUSES) {
        merged[status] = res.board?.[status] ?? [];
      }
      setBoard(merged);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshHistory = useCallback(async () => {
    try {
      const res = await taskboardApi.getHistory();
      setUndoDepth(res.undo_depth ?? 0);
      setRedoDepth(res.redo_depth ?? 0);
    } catch {
      // Non-fatal: undo/redo buttons just stay disabled.
    }
  }, []);

  useEffect(() => {
    void refresh();
    void refreshHistory();
  }, [refresh, refreshHistory]);

  const handleUndo = async () => {
    try {
      const res = await taskboardApi.undo();
      setUndoDepth(res.undo_depth ?? 0);
      setRedoDepth(res.redo_depth ?? 0);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Undo failed');
    }
  };

  const handleRedo = async () => {
    try {
      const res = await taskboardApi.redo();
      setUndoDepth(res.undo_depth ?? 0);
      setRedoDepth(res.redo_depth ?? 0);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Redo failed');
    }
  };

  // Undo / redo shortcuts (Ctrl+Z, Ctrl+Shift+Z, Ctrl+Y).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inInput =
        target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT');
      if (inInput || !(e.ctrlKey || e.metaKey)) return;
      if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) void handleRedo();
        else void handleUndo();
      } else if (e.key.toLowerCase() === 'y') {
        e.preventDefault();
        void handleRedo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const totalCount = useMemo(
    () => TASK_STATUSES.reduce((sum, s) => sum + board[s].length, 0),
    [board]
  );

  const handleMove = async (task: TaskboardTask, status: TaskStatus) => {
    try {
      await taskboardApi.moveTask(task.id, status);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Move failed');
    }
  };

  const handleDelete = async (task: TaskboardTask) => {
    try {
      await taskboardApi.deleteTask(task.id);
      setConfirmDelete(null);
      setEditing(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const handleDrop = (status: TaskStatus) => {
    if (dragged && dragged.status !== status) {
      void handleMove(dragged, status);
    }
    setDragged(null);
  };

  const handleToggleTimer = async (task: TaskboardTask) => {
    try {
      if (task.metadata?.timer_started_at) {
        await taskboardApi.stopTimer(task.id);
      } else {
        await taskboardApi.startTimer(task.id);
      }
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Timer failed');
    }
  };

  const handleCreatePlan = async () => {
    if (!planGoal.trim()) {
      setPlanError(t('taskboard.plan_goal_required'));
      return;
    }
    setPlanBusy(true);
    setPlanError(null);
    try {
      const created = await plansApi.create(planGoal.trim());
      setPlan(created);
      await refresh();
    } catch (e) {
      setPlanError(e instanceof Error ? e.message : 'Plan creation failed');
    } finally {
      setPlanBusy(false);
    }
  };

  const handleExecutePlan = async () => {
    if (!plan) return;
    setPlanBusy(true);
    setPlanError(null);
    try {
      await plansApi.execute(plan.id);
      setPlan({ ...plan, status: 'in_progress' });
    } catch (e) {
      setPlanError(e instanceof Error ? e.message : 'Execute failed');
    } finally {
      setPlanBusy(false);
    }
  };

  const handleCancelPlan = async () => {
    if (!plan) return;
    setPlanBusy(true);
    try {
      await plansApi.cancel(plan.id);
      setPlan({ ...plan, status: 'cancelled' });
    } catch (e) {
      setPlanError(e instanceof Error ? e.message : 'Cancel failed');
    } finally {
      setPlanBusy(false);
    }
  };

  const openMemoryContext = async () => {
    setMemoryOpen(true);
    setMemoryLoading(true);
    setMemoryContext('');
    try {
      const res = await taskboardApi.getMemoryContext();
      setMemoryContext(res.context ?? '');
    } catch (e) {
      setMemoryContext(e instanceof Error ? e.message : 'Failed to load memory context');
    } finally {
      setMemoryLoading(false);
    }
  };

  const taskTimeSpent = (task: TaskboardTask): string => {
    const seconds = typeof task.metadata?.time_spent_seconds === 'number' ? task.metadata.time_spent_seconds : 0;
    if (seconds <= 0) return '';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const renderCard = (task: TaskboardTask) => {
    const prevStatus = adjacentStatus(task.status, -1);
    const nextStatus = adjacentStatus(task.status, 1);
    const priorityTone = PRIORITY_TONE[task.priority] ?? 'medium';
    return (
      <article
        key={task.id}
        className={`${styles.taskCard} ${styles[`cardPriority${priorityTone}` as const]}`}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = 'move';
          setDragged(task);
        }}
        onDragEnd={() => setDragged(null)}
        onClick={() => setEditing(task)}
      >
        <div className={styles.taskCardTitle}>{task.title}</div>
        {(task.description || '').trim() && (
          <div className={styles.taskCardDesc}>{(task.description ?? '').slice(0, 80)}</div>
        )}
        {task.status === 'blocked' && Boolean(task.metadata?.block_reason) && (
          <div className={styles.taskBlockedReason}>⛔ {`${task.metadata?.block_reason}`}</div>
        )}
        <div className={styles.taskCardMeta}>
          <span className={`${styles.priorityBadge} ${styles[`badgePriority${priorityTone}` as const]}`}>
            {t(PRIORITY_NAME_KEY[task.priority] ?? 'taskboard.priority_medium')}
          </span>
          {task.assignee && <span className={styles.taskAssignee}>👤 {task.assignee}</span>}
          {Array.isArray(task.tags) &&
            task.tags.slice(0, 3).map((tag) => (
              <span key={tag} className={styles.taskTag}>
                {tag}
              </span>
            ))}
        </div>
        <div className={styles.taskCardFooter}>
          {taskTimeSpent(task) && <span className={styles.taskTime}>⏱ {taskTimeSpent(task)}</span>}
          <div className={styles.moveControls}>
            {prevStatus && (
              <button
                type="button"
                className={styles.moveBtn}
                aria-label={`Move "${task.title}" to ${t(STATUS_LABEL_KEY[prevStatus])}`}
                onClick={(e) => {
                  e.stopPropagation();
                  void handleMove(task, prevStatus);
                }}
              >
                ‹
              </button>
            )}
            {nextStatus && (
              <button
                type="button"
                className={styles.moveBtn}
                aria-label={`Move "${task.title}" to ${t(STATUS_LABEL_KEY[nextStatus])}`}
                onClick={(e) => {
                  e.stopPropagation();
                  void handleMove(task, nextStatus);
                }}
              >
                ›
              </button>
            )}
          </div>
          {task.status === 'in_progress' && (
            <button
              type="button"
              className={styles.taskTimerBtn}
              aria-label={t('taskboard.toggle_timer', {
                defaultValue: `${task.metadata?.timer_started_at ? 'Stop' : 'Start'} timer for "${task.title}"`,
              })}
              onClick={(e) => {
                e.stopPropagation();
                void handleToggleTimer(task);
              }}
            >
              {task.metadata?.timer_started_at ? '⏹' : '▶'}
            </button>
          )}
        </div>
        {typeof task.progress === 'number' && task.progress > 0 && (
          <div
            className={styles.taskProgress}
            role="progressbar"
            aria-label={`Progress of "${task.title}"`}
            aria-valuenow={Math.round(task.progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className={styles.taskProgressFill} style={{ width: `${Math.min(100, Math.max(0, task.progress))}%` }} />
          </div>
        )}
      </article>
    );
  };

  const boardEmpty = !loading && isBoardEmpty(board);

  return (
    <div className={styles.taskboardPage}>
      <div className={styles.pageHeader}>
        <div>
          <h1>{t('nav.taskboard')}</h1>
          <p className={styles.pageSubtitle}>{t('taskboard.description')}</p>
        </div>
        <div className={styles.pageActions}>
          <div className={styles.historyActions}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={undoDepth === 0}
              onClick={() => void handleUndo()}
              title={t('taskboard.undo')}
              aria-label={t('taskboard.undo')}
            >
              ↩ {t('taskboard.undo')}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={redoDepth === 0}
              onClick={() => void handleRedo()}
              title={t('taskboard.redo')}
              aria-label={t('taskboard.redo')}
            >
              ↪ {t('taskboard.redo')}
            </button>
          </div>
          <span
            className={`${styles.liveIndicator} ${liveConnected ? styles.liveOn : styles.liveOff}`}
            title={liveConnected ? t('taskboard.live_on') : t('taskboard.live_off')}
          >
            <span className={styles.liveDot} aria-hidden="true" />
            {liveConnected ? t('taskboard.live_on') : t('taskboard.live_off')}
          </span>
          <span className={styles.taskCount}>
            {t('taskboard.total_tasks', { count: totalCount })}
          </span>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => void refresh()}
            disabled={loading}
          >
            {loading ? t('common.loading') : t('common.refresh')}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => void openMemoryContext()}
            aria-label={t('taskboard.memory_context')}
          >
            🧠 {t('taskboard.memory_context')}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setPlanOpen(true)}
            aria-label={t('taskboard.new_plan')}
          >
            🎯 {t('taskboard.new_plan')}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>
            + {t('taskboard.new_task')}
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.taskboardError} role="alert">
          ⚠ {error}
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label={t('taskboard.dismiss_error', { defaultValue: 'Dismiss error' })}
          >
            ×
          </button>
        </div>
      )}

      {loading && totalCount === 0 ? (
        <div className={styles.boardSkeleton} aria-hidden="true">
          {TASK_STATUSES.map((status) => (
            <div key={status} className={styles.boardSkeletonColumn}>
              <Skeleton height={16} rounded={8} />
              <Skeleton height={92} rounded={10} />
              <Skeleton height={92} rounded={10} />
            </div>
          ))}
        </div>
      ) : boardEmpty ? (
        <EmptyState
          title={t('taskboard.board_empty_title', { defaultValue: 'The board is empty' })}
          description={t('taskboard.board_empty_desc', {
            defaultValue: 'Create your first task to start tracking agent work.',
          })}
          action={
            <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>
              + {t('taskboard.new_task')}
            </button>
          }
        />
      ) : (
        <div className={styles.boardScroll}>
          <div className={styles.boardColumns}>
            {TASK_STATUSES.map((status) => (
              <section
                key={status}
                aria-label={t(STATUS_LABEL_KEY[status])}
                className={`${styles.boardColumn} ${styles[COLUMN_CLASS[status] as keyof typeof styles]}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(status);
                }}
              >
                <header className={styles.boardColumnHeader}>
                  <span className={styles.columnDot} aria-hidden="true" />
                  <span className={styles.columnTitle}>{t(STATUS_LABEL_KEY[status])}</span>
                  <span className={styles.columnCount}>{board[status].length}</span>
                </header>
                <div className={styles.boardColumnBody}>
                  {board[status].length === 0 ? (
                    <div className={styles.columnEmpty}>{t('taskboard.empty_column')}</div>
                  ) : (
                    board[status].map(renderCard)
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}

      {creating && (
        <TaskModal
          title={t('taskboard.new_task')}
          initial={{ status: 'backlog', priority: 2 } as CreateTaskPayload}
          onClose={() => setCreating(false)}
          onSubmit={async (payload) => {
            await taskboardApi.createTask(payload);
            setCreating(false);
            await refresh();
          }}
          t={t}
        />
      )}

      {editing && (
        <TaskModal
          title={t('taskboard.edit_task')}
          initial={{
            title: editing.title,
            description: editing.description ?? '',
            status: editing.status,
            priority: editing.priority,
            assignee: editing.assignee ?? '',
            tags: editing.tags ?? [],
          }}
          onClose={() => setEditing(null)}
          onSubmit={async (payload) => {
            await taskboardApi.updateTask(editing.id, payload);
            setEditing(null);
            await refresh();
          }}
          onDelete={editing ? () => setConfirmDelete(editing) : undefined}
          t={t}
        />
      )}

      {memoryOpen && (
        <div className="modal-overlay" onClick={() => setMemoryOpen(false)}>
          <div className={styles.memoryModal} onClick={(e) => e.stopPropagation()}>
            <h3>🧠 {t('taskboard.memory_context')}</h3>
            <p className={styles.modalHint}>{t('taskboard.memory_hint')}</p>
            <pre className={styles.memoryContent}>
              {memoryLoading ? t('common.loading') : memoryContext || t('taskboard.memory_empty')}
            </pre>
            <div className={styles.modalActions}>
              <div className={styles.modalActionsSpacer} />
              <button type="button" className="btn btn-secondary" onClick={() => setMemoryOpen(false)}>
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {planOpen && (
        <div className="modal-overlay" onClick={() => setPlanOpen(false)}>
          <div className={styles.planModal} onClick={(e) => e.stopPropagation()}>
            <h3>{t('taskboard.plan_title')}</h3>
            <p className={styles.modalHint}>{t('taskboard.plan_hint')}</p>
            {!plan ? (
              <>
                <textarea
                  className={styles.formTextarea}
                  rows={3}
                  value={planGoal}
                  onChange={(e) => setPlanGoal(e.target.value)}
                  placeholder={t('taskboard.plan_goal_placeholder')}
                  aria-label={t('taskboard.plan_goal_label')}
                />
                {planError && <div className={styles.modalError} role="alert">⚠ {planError}</div>}
                <div className={styles.modalActions}>
                  <div className={styles.modalActionsSpacer} />
                  <button type="button" className="btn btn-secondary" onClick={() => setPlanOpen(false)}>
                    {t('common.cancel')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={planBusy}
                    onClick={() => void handleCreatePlan()}
                  >
                    {planBusy ? t('common.saving') : t('taskboard.plan_create')}
                  </button>
                </div>
              </>
            ) : (
              <PlanDetail
                plan={plan}
                busy={planBusy}
                error={planError}
                onExecute={() => void handleExecutePlan()}
                onCancel={() => void handleCancelPlan()}
                onClose={() => {
                  setPlanOpen(false);
                  setPlan(null);
                  setPlanGoal('');
                  setPlanError(null);
                }}
                t={t}
              />
            )}
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3>{t('taskboard.confirm_delete_title')}</h3>
            <p>{t('taskboard.confirm_delete_message', { title: confirmDelete.title })}</p>
            <div className={styles.modalActions}>
              <button type="button" className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>
                {t('common.cancel')}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => void handleDelete(confirmDelete)}
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface PlanDetailProps {
  plan: AgentPlan;
  busy: boolean;
  error: string | null;
  onExecute: () => void;
  onCancel: () => void;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, options?: any) => string;
}

function PlanDetail({ plan, busy, error, onExecute, onCancel, onClose, t }: PlanDetailProps) {
  const canExecute = plan.status === 'pending' || plan.status === 'created';
  const canCancel = plan.status === 'in_progress' || plan.status === 'pending';

  return (
    <div className={styles.planDetail}>
      <div className={styles.planGoal}>
        <strong>{t('taskboard.plan_goal_label')}:</strong> {plan.goal}
      </div>
      <div className={`${styles.planStatus} ${styles[PLAN_STATUS_CLASS[plan.status] as keyof typeof styles] ?? ''}`}>
        {t(`taskboard.plan_status_${plan.status}`, { defaultValue: plan.status })}
      </div>
      {error && <div className={styles.modalError} role="alert">⚠ {error}</div>}
      <ul className={styles.planTasks}>
        {plan.tasks.map((node: AgentPlanTaskNode) => (
          <li key={node.id} className={styles.planTaskNode}>
            <span className={styles.planTaskTitle}>
              {node.title} <em className={styles.planTaskType}>({node.type})</em>
            </span>
            {node.depends_on.length > 0 && (
              <span className={styles.planTaskDeps}>⛓ {node.depends_on.length} dep(s)</span>
            )}
          </li>
        ))}
      </ul>
      <div className={styles.modalActions}>
        {canCancel && (
          <button type="button" className="btn btn-secondary" disabled={busy} onClick={onCancel}>
            {t('taskboard.plan_cancel')}
          </button>
        )}
        <div className={styles.modalActionsSpacer} />
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          {t('common.close')}
        </button>
        {canExecute && (
          <button type="button" className="btn btn-primary" disabled={busy} onClick={onExecute}>
            {busy ? t('common.saving') : t('taskboard.plan_execute')}
          </button>
        )}
      </div>
    </div>
  );
}

interface TaskModalProps {
  title: string;
  initial: CreateTaskPayload;
  onClose: () => void;
  onSubmit: (payload: CreateTaskPayload) => Promise<void>;
  onDelete?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, options?: any) => string;
}

function TaskModal({ title, initial, onClose, onSubmit, onDelete, t }: TaskModalProps) {
  const [payload, setPayload] = useState<CreateTaskPayload>({
    ...initial,
    status: initial.status ?? 'backlog',
    priority: initial.priority ?? 2,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateVars, setTemplateVars] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    taskboardApi
      .getTemplates()
      .then((res) => {
        if (!cancelled) setTemplates(res.templates ?? []);
      })
      .catch(() => {
        if (!cancelled) setTemplates([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const applyTemplate = (template: TaskTemplate) => {
    let filled = template.title ?? '';
    for (const [key, value] of Object.entries(templateVars)) {
      filled = filled.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    setPayload((prev) => ({
      ...prev,
      title: filled,
      priority: template.priority || prev.priority,
      assignee: template.assignee || prev.assignee,
      tags: template.tags ?? prev.tags,
      status: prev.status ?? 'backlog',
    }));
  };

  const handleTemplateSelect = (name: string) => {
    setSelectedTemplate(name);
    const template = templates.find((item) => item.name === name);
    if (template?.defaults) {
      const vars: Record<string, string> = {};
      for (const key of Object.keys(template.defaults)) {
        vars[key] = '';
      }
      setTemplateVars(vars);
    }
  };

  const previewTitle = (() => {
    const template = templates.find((item) => item.name === selectedTemplate);
    if (!template) return payload.title ?? '';
    let filled = template.title ?? '';
    for (const [key, value] of Object.entries(templateVars)) {
      filled = filled.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    return filled;
  })();

  const update = <K extends keyof CreateTaskPayload>(key: K, value: CreateTaskPayload[K]) =>
    setPayload((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payload.title?.trim()) {
      setError(t('taskboard.title_required'));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed');
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className={styles.taskModal} onSubmit={(e) => void handleSubmit(e)} onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {error && <div className={styles.modalError} role="alert">⚠ {error}</div>}
        {templates.length > 0 && (
          <div className={styles.templatePicker}>
            <label className={styles.formLabel}>
              {t('taskboard.from_template')}
              <select
                className={styles.formInput}
                value={selectedTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
              >
                <option value="">{t('taskboard.template_none')}</option>
                {templates.map((template) => (
                  <option key={template.name} value={template.name}>
                    {template.name} — {template.description}
                  </option>
                ))}
              </select>
            </label>
            {selectedTemplate &&
              templates.find((item) => item.name === selectedTemplate)?.defaults && (
                <div className={styles.templateVars}>
                  {Object.entries(
                    templates.find((item) => item.name === selectedTemplate)?.defaults ?? {}
                  ).map(([key, hint]) => (
                    <label key={key} className={styles.formLabel}>
                      {key}
                      <input
                        className={styles.formInput}
                        value={templateVars[key] ?? ''}
                        placeholder={hint}
                        onChange={(e) =>
                          setTemplateVars((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                      />
                    </label>
                  ))}
                  <div className={styles.templatePreview}>
                    {t('taskboard.template_preview')}: {previewTitle || '—'}
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      const template = templates.find((item) => item.name === selectedTemplate);
                      if (template) applyTemplate(template);
                    }}
                  >
                    {t('taskboard.template_apply')}
                  </button>
                </div>
              )}
          </div>
        )}
        <label className={styles.formLabel}>
          {t('taskboard.title')} *
          <input
            className={styles.formInput}
            value={payload.title ?? ''}
            onChange={(e) => update('title', e.target.value)}
            placeholder={t('taskboard.title_placeholder')}
            autoFocus
          />
        </label>
        <label className={styles.formLabel}>
          {t('taskboard.description')}
          <textarea
            className={styles.formTextarea}
            value={payload.description ?? ''}
            onChange={(e) => update('description', e.target.value)}
            rows={3}
          />
        </label>
        <div className={styles.formRow}>
          <label className={styles.formLabel}>
            {t('taskboard.status')}
            <select
              className={styles.formInput}
              value={payload.status}
              onChange={(e) => update('status', e.target.value as TaskStatus)}
            >
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t(`taskboard.status_${status}`)}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.formLabel}>
            {t('taskboard.priority')}
            <select
              className={styles.formInput}
              value={payload.priority}
              onChange={(e) => update('priority', Number(e.target.value))}
            >
              <option value={1}>{t('taskboard.priority_high')}</option>
              <option value={2}>{t('taskboard.priority_medium')}</option>
              <option value={3}>{t('taskboard.priority_low')}</option>
            </select>
          </label>
        </div>
        <label className={styles.formLabel}>
          {t('taskboard.assignee')}
          <input
            className={styles.formInput}
            value={payload.assignee ?? ''}
            onChange={(e) => update('assignee', e.target.value)}
            placeholder="agent_id / human"
          />
        </label>
        <div className={styles.modalActions}>
          {onDelete && (
            <button type="button" className="btn btn-danger" onClick={onDelete}>
              {t('common.delete')}
            </button>
          )}
          <div className={styles.modalActionsSpacer} />
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? t('common.saving') : t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
