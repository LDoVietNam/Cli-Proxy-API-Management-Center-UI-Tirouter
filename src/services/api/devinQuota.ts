import type { DevinQuotaData, DevinQuotaWindow } from '@/types';

const asRecord = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const parsePercent = (value: unknown): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 && value <= 100 ? value : null;
  }
  if (typeof value !== 'string' || !/^\d+(?:\.\d+)?$/.test(value.trim())) return null;
  const percent = Number(value);
  return Number.isFinite(percent) && percent >= 0 && percent <= 100 ? percent : null;
};

const parseUnixSeconds = (value: unknown): number | null => {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && !/^\d+$/.test(value.trim())) return null;
  const seconds = Number(value);
  const ms = seconds * 1000;
  return Number.isSafeInteger(seconds) && ms > 0 && Number.isFinite(new Date(ms).getTime())
    ? ms
    : null;
};

/** Normalize the live Connect-RPC response, never auth-file metadata or quota.signals. */
export function readDevinQuotaResponse(payload: unknown): DevinQuotaData {
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch {
      payload = null;
    }
  }
  const status = asRecord(asRecord(asRecord(payload).userStatus).planStatus);
  const planInfo = asRecord(status.planInfo);
  const windows: DevinQuotaWindow[] = (['daily', 'weekly'] as const).map((id) => ({
    id,
    label: id === 'daily' ? 'Daily' : 'Weekly',
    usedPercent: parsePercent(status[`${id}QuotaRemainingPercent`]) !== null ? 100 - parsePercent(status[`${id}QuotaRemainingPercent`])! : null,
    resetLabel: '',
    resetAtMs: parseUnixSeconds(status[`${id}QuotaResetAtUnix`]),
    periodHours: id === 'daily' ? 24 : 168,
  }));
  return {
    windows,
    planType: typeof planInfo.planName === 'string' ? planInfo.planName.trim() || null : null,
  };
}

export const hasDevinQuotaObservation = (quota: DevinQuotaData): boolean =>
  quota.windows.some((window) => window.usedPercent !== null || window.resetAtMs !== null);
