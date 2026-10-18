/**
 * Tab state của trang quota (management | monitoring) — parse/serialize URL query.
 *
 * Pure functions, không đụng react-router: QuotaPage dùng useSearchParams rồi
 * đưa URLSearchParams vào đây. Tách riêng để test được logic query param mà
 * không cần render (<a spec TASK B bước 8>).
 */

export type QuotaPageTab = 'management' | 'monitoring';

const VALID_TABS: readonly QuotaPageTab[] = ['management', 'monitoring'];

/** Type guard cho giá trị đọc từ URL query (coi mọi thứ là unknown). */
export function isQuotaPageTab(value: unknown): value is QuotaPageTab {
  return typeof value === 'string' && (VALID_TABS as readonly string[]).includes(value);
}

/**
 * Đọc `?tab=` từ query. Fallback `management` cho mọi giá trị thiếu/rác —
 * route cũ `/quota-monitoring` redirect về `/quota?tab=monitoring` nên
 * giá trị mặc định phải là tab management (nội dung quota gốc).
 */
export function parseQuotaPageTab(params: URLSearchParams): QuotaPageTab {
  const raw = params.get('tab');
  return isQuotaPageTab(raw) ? raw : 'management';
}

/**
 * Chuẩn bị giá trị ghi vào `?tab=`. `management` → null (xóa param, URL sạch);
 * `monitoring` → 'monitoring' (deep-link giữ được).
 */
export function serializeQuotaPageTab(tab: QuotaPageTab): string | null {
  return tab === 'monitoring' ? 'monitoring' : null;
}
