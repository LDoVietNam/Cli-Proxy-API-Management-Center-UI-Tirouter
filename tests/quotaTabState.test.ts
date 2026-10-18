import { describe, expect, test } from 'bun:test';
import {
  isQuotaPageTab,
  parseQuotaPageTab,
  serializeQuotaPageTab,
} from '@/features/quota/quotaTabState';

describe('isQuotaPageTab', () => {
  test('chỉ nhận 2 giá trị tab hợp lệ của trang quota', () => {
    expect(isQuotaPageTab('management')).toBe(true);
    expect(isQuotaPageTab('monitoring')).toBe(true);
    expect(isQuotaPageTab('all')).toBe(false);
    expect(isQuotaPageTab('')).toBe(false);
    expect(isQuotaPageTab('quota')).toBe(false);
  });

  test('từ chối giá trị không phải string (type-narrowing an toàn cho URL params)', () => {
    expect(isQuotaPageTab(null)).toBe(false);
    expect(isQuotaPageTab(undefined)).toBe(false);
  });
});

describe('parseQuotaPageTab', () => {
  test('?tab=monitoring → monitoring (deep-link tab 2)', () => {
    expect(parseQuotaPageTab(new URLSearchParams('?tab=monitoring'))).toBe('monitoring');
  });

  test('không có param → management (mặc định tab 1)', () => {
    expect(parseQuotaPageTab(new URLSearchParams(''))).toBe('management');
    expect(parseQuotaPageTab(new URLSearchParams('?page=2'))).toBe('management');
  });

  test('param rác → fallback management, không throw', () => {
    expect(parseQuotaPageTab(new URLSearchParams('?tab=hero'))).toBe('management');
    expect(parseQuotaPageTab(new URLSearchParams('?tab=management'))).toBe('management');
  });
});

describe('serializeQuotaPageTab', () => {
  test('monitoring → "monitoring" (ghi vào URL query để deep-link)', () => {
    expect(serializeQuotaPageTab('monitoring')).toBe('monitoring');
  });

  test('management → null (không giữ query rác trên URL mặc định)', () => {
    expect(serializeQuotaPageTab('management')).toBeNull();
  });
});
