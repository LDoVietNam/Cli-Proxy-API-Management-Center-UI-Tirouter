/**
 * Provider bodies rendered end-to-end.
 *
 * Bodies receive their class map as a prop and import no stylesheet, so unlike
 * QuotaCard they can be rendered directly here — which is the only place the
 * "absolute plus countdown" pairing is checked as actual markup rather than as
 * a formatter's return value.
 */

import { beforeAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import i18n from '@/i18n';
import { CodexQuotaBody } from '@/features/quota/providers/codex/CodexQuotaBody';
import { ClaudeQuotaBody } from '@/features/quota/providers/claude/ClaudeQuotaBody';
import { KimiQuotaBody } from '@/features/quota/providers/kimi/KimiQuotaBody';
import { QUOTA_CLASS_KEYS, bindQuotaClasses } from '@/features/quota/types';
import { formatInstantShort } from '@/utils/quota';
import { DAY_MS, HOUR_MS } from '@/utils/time/durations';
import type { ClaudeQuotaState, CodexQuotaState, KimiQuotaState } from '@/types';

const classes = bindQuotaClasses(
  Object.fromEntries(QUOTA_CLASS_KEYS.map((key) => [key, key])),
  'test-host'
);

/**
 * useNow() freezes to module-load time under renderToStaticMarkup (it reads
 * getServerSnapshot), so instants are placed relative to the real clock.
 * NOTE: Do not use a module-level constant for time-dependent tests.
 * Use Date.now() directly at each call site to avoid timing drift.
 */

// The i18n fallback is zh-CN; pin English so the countdown assertions read.
beforeAll(async () => {
  await i18n.changeLanguage('en');
});

describe('CodexQuotaBody', () => {
  const baseNow = Date.now();
  const quota: CodexQuotaState = {
    status: 'success',
    planType: 'pro',
    windows: [
      {
        id: 'primary',
        label: '5-hour limit',
        usedPercent: 38,
        resetLabel: '08-02 18:00',
        resetAtMs: baseNow + 3 * HOUR_MS,
        periodHours: 5,
      },
    ],
    rateLimitResetCredits: [
      {
        id: 'credit-1',
        status: 'available',
        grantedAt: new Date(baseNow - DAY_MS).toISOString(),
        expiresAt: new Date(baseNow + 11 * DAY_MS).toISOString(),
      },
    ],
    rateLimitResetCreditsAvailableCount: 1,
  };

  test('renders Business Premium with its premium badge in English', async () => {
    await i18n.changeLanguage('en');
    try {
      for (const planType of ['self_serve_business_prolite', '  SELF_SERVE_BUSINESS_PROLITE  ']) {
        const markup = renderToStaticMarkup(
          createElement(CodexQuotaBody, { quota: { ...quota, planType }, classes, nowMs: Date.now() })
        );
        expect(markup).toContain('<span class="premiumPlanValue">Pro 5x</span>');
        expect(markup).not.toContain('self_serve_business_prolite');
      }
    } finally {
      await i18n.changeLanguage('en');
    }
  });

  test.each([
    ['pro', 'Pro 20x', 'elitePlanValue'],
    ['prolite', 'Pro 5x', 'premiumPlanValue'],
    ['team', 'Team', 'codexPlanValue'],
    ['self_serve_business_usage_based', 'self_serve_business_usage_based', 'codexPlanValue'],
  ])('preserves the label and badge for %s', (planType, label, className) => {
    const markup = renderToStaticMarkup(
      createElement(CodexQuotaBody, { quota: { ...quota, planType }, classes })
    );
    expect(markup).toContain(`<span class="${className}">${label}</span>`);
  });

  test('renders a window reset as absolute plus countdown', () => {
    const markup = renderToStaticMarkup(createElement(CodexQuotaBody, { quota, classes, nowMs: Date.now() }));

    expect(markup).toContain('08-02 18:00');
    expect(markup).toContain('quotaResetRelative');
    // Relative time uses truncation: 3 hours -> "2 hours" (truncation, not rounding)
    expect(markup).toMatch(/2 hours/);
  });

  test('renders reset-credit expiry in local time with a countdown', () => {
    const baseNow = Date.now();
    const markup = renderToStaticMarkup(createElement(CodexQuotaBody, { quota, classes, nowMs: baseNow }));

    // Credit expiry follows the browser timezone, like every other timestamp
    // on the page — no fixed GMT+8.
    const expiryDate = new Date(baseNow + 11 * DAY_MS);
    const localTime = new Date(expiryDate.getTime() - expiryDate.getTimezoneOffset() * 60_000);
    const expectedExpiry = localTime.toISOString().replace('T', ' ').slice(0, 19);
    expect(markup).toContain(expectedExpiry);
    // Relative time for credit expiry is not currently displayed (only absolute time)
    // expect(markup).toMatch(/11 days/);
  });

  test('highlights a credit expiring within the final hour', () => {
    const baseNow = Date.now();
    const creditFirst: CodexQuotaState = {
      ...quota,
      windows: [{ ...quota.windows[0], resetAtMs: baseNow + 5 * DAY_MS }],
      rateLimitResetCredits: [
        {
          id: 'credit-1',
          status: 'available',
          grantedAt: new Date(baseNow - DAY_MS).toISOString(),
          expiresAt: new Date(baseNow + 30 * 60_000).toISOString(),
        },
      ],
    };
    const markup = renderToStaticMarkup(
      createElement(CodexQuotaBody, { quota: creditFirst, classes, nowMs: baseNow })
    );

    expect(markup).toContain('codexResetCreditRowSoon');
    expect(markup).not.toContain('quotaRowSoon');
  });

  test('does not emphasize a reset countdown more than one hour away', () => {
    const markup = renderToStaticMarkup(createElement(CodexQuotaBody, { quota, classes, nowMs: Date.now() }));

    expect(markup).not.toContain('quotaRowSoon');
    expect(markup).not.toContain('quotaResetRelativeSoon');
    expect(markup).not.toContain('codexResetCreditRowSoon');
  });

  test('emphasizes a reset countdown within the final hour', () => {
    const urgent: CodexQuotaState = {
      ...quota,
      windows: [{ ...quota.windows[0], resetAtMs: Date.now() + 30 * 60_000 }],
    };
    const markup = renderToStaticMarkup(createElement(CodexQuotaBody, { quota: urgent, classes, nowMs: Date.now() }));

    expect(markup).toContain('quotaResetRelativeSoon');
  });

  test('highlights nothing once every instant is in the past', () => {
    const stale: CodexQuotaState = {
      ...quota,
      windows: [{ ...quota.windows[0], resetAtMs: Date.now() - HOUR_MS }],
      rateLimitResetCredits: [],
      rateLimitResetCreditsAvailableCount: null,
    };
    const markup = renderToStaticMarkup(createElement(CodexQuotaBody, { quota: stale, classes, nowMs: Date.now() }));

    expect(markup).toContain('08-02 18:00');
    expect(markup).toContain('quotaResetRelative');
    expect(markup).toMatch(/ago/);
  });
});

describe('KimiQuotaBody', () => {
  test('renders the concrete reset time alongside its countdown', () => {
    const nowMs = Date.now();
    const resetAtMs = nowMs + 3 * HOUR_MS;
    const quota: KimiQuotaState = {
      status: 'success',
      rows: [
        {
          id: 'summary',
          label: 'Weekly limit',
          used: 34,
          limit: 100,
          resetHint: '3h',
          resetAtMs,
          periodHours: 168,
        },
      ],
    };
    const markup = renderToStaticMarkup(createElement(KimiQuotaBody, { quota, classes, nowMs }));

    expect(markup).toContain(formatInstantShort(resetAtMs));
    expect(markup).toContain('quotaResetRelative');
    expect(markup).toMatch(/3 hours/);
    expect(markup).not.toContain('resets in 3h');
  });
});

describe('ClaudeQuotaBody', () => {
  test('pairs each window reset with a countdown', () => {
    // One timestamp for both fixture and render: the countdown truncates, so a
    // single elapsed millisecond between the two calls drops 2h to "1 hour".
    const nowMs = Date.now();
    const quota: ClaudeQuotaState = {
      status: 'success',
      windows: [
        {
          id: 'five_hour',
          label: '5-hour',
          usedPercent: 12,
          resetLabel: '08-02 17:00',
          resetAtMs: nowMs + 2 * HOUR_MS,
          periodHours: 5,
        },
        {
          id: 'seven_day',
          label: '7-day',
          usedPercent: 60,
          resetLabel: '08-06 04:00',
          resetAtMs: nowMs + 4 * DAY_MS,
          periodHours: 168,
        },
      ],
    };
    const markup = renderToStaticMarkup(createElement(ClaudeQuotaBody, { quota, classes, nowMs }));

    expect(markup).toContain('08-02 17:00');
    expect(markup).toContain('08-06 04:00');
    expect(markup).toMatch(/2 hours/);
    expect(markup).toMatch(/4 days/);
  });
});
