/**
 * 认证文件相关类型
 * 基于原项目 src/modules/auth-files.js
 */

import type { RecentRequestBucket } from '@/utils/recentRequests';

export type AuthFileType =
  | 'qwen'
  | 'kimi'
  | 'gemini'
  | 'aistudio'
  | 'claude'
  | 'codex'
  | 'devin'
  | 'meta'
  | 'antigravity'
  | 'xai'
  | 'iflow'
  | 'vertex'
  | 'empty'
  | 'unknown';

export interface AuthFileItem {
  name: string;
  type?: AuthFileType | string;
  provider?: string;
  /**
   * 凭证账号邮箱（后端 auth_files 两条分支都会填：磁盘扫描读 JSON 的 email 字段，
   * 注册表读 Metadata/Attributes）。卡片主行用它领衔。
   * 注意：后端还会下发 account/account_type，但 api-key 类凭证的 account 就是
   * API key 本身（AccountInfo() → return "api_key", apiKey），**绝不可用于展示或搜索**。
   */
  email?: string;
  /** GCP / Vertex 项目 ID，账号邮箱缺失时作为身份回落。 */
  projectId?: string;
  size?: number;
  authIndex?: string | number | null;
  runtimeOnly?: boolean | string;
  disabled?: boolean;
  unavailable?: boolean;
  status?: string;
  statusMessage?: string;
  lastRefresh?: string | number;
  modified?: number;
  priority?: number;
  weight?: number;
  note?: string;
  success?: unknown;
  failed?: unknown;
  /** 归一化后的累计成功/失败计数（由 API 边界从 success/failed 生字段填充）。 */
  successCount?: number;
  failureCount?: number;
  /** Per-credential cooldown timers normalized from the raw `cooldowns` field. */
  cooldownSnapshot?: AuthFileCooldownSnapshot;
  recent_requests?: RecentRequestBucket[];
  recentRequests?: RecentRequestBucket[];
  [key: string]: unknown;
}

export interface AuthFileCooldown {
  scope: 'model' | 'credential';
  reason: string;
  remainingSeconds: number;
  retryAt?: string;
  modelKey?: string;
  backoffLevel?: number;
  httpStatus?: number;
}

export interface AuthFileCooldownSnapshot {
  /**
   * Null means the backend sent a cooldown payload we cannot interpret
   * (unknown state); [] means the backend explicitly reports no timers.
   */
  records: AuthFileCooldown[] | null;
  receivedAtMs: number;
  observedAt?: string;
}

export interface AuthFilesResponse {
  files: AuthFileItem[];
  total?: number;
  /** Raw backend observation timestamp (snake_case passthrough). */
  observed_at?: unknown;
  /** Normalized observed_at (ISO string), when the backend sent a valid one. */
  observedAt?: string;
}
