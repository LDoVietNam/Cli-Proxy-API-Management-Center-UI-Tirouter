/**
 * Kimi quota rendering body.
 */

import { useTranslation } from 'react-i18next';
import type { KimiQuotaState } from '@/types';
import { buildResetDisplay } from '@/utils/quota/relativeTime';
import { QuotaMeter } from '../../components/QuotaMeter';
import type { QuotaBodyProps } from '../../types';
import { useNow } from '@/hooks/useNow';

export function KimiQuotaBody({ quota, classes, nowMs: nowMsProp }: QuotaBodyProps<KimiQuotaState> & { nowMs?: number }) {
  const { t } = useTranslation();
  // useNow (not Date.now default) — react-compiler lint: impure call in render.
  // Hook must run before the early return below.
  const now = useNow();
  const nowMs = nowMsProp ?? now;
  const rows = quota.rows ?? [];

  if (rows.length === 0) {
    return <div className={classes.quotaMessage}>{t('kimi_quota.empty_data')}</div>;
  }

  return (
    <>
      {rows.map((row, index) => {
        const limit = row.limit;
        const used = row.used;
        const remaining =
          limit > 0
            ? Math.max(0, Math.min(100, Math.round(((limit - used) / limit) * 100)))
            : used > 0
              ? 0
              : null;
        const percentLabel = remaining === null ? '--' : `${remaining}%`;
        const rowLabel = row.labelKey
          ? t(row.labelKey, (row.labelParams ?? {}) as Record<string, string | number>)
          : (row.label ?? '');

        // Build reset display with both absolute and relative time
        const resetDisplay = buildResetDisplay(
          null,
          row.resetAtMs,
          nowMs
        );

        return (
          <div key={row.id} className={classes.quotaRow}>
            <div className={classes.quotaRowHeader}>
              <span className={classes.quotaModel}>{rowLabel}</span>
              <div className={classes.quotaMeta}>
                <span className={classes.quotaPercent}>{percentLabel}</span>
                {resetDisplay?.absolute && (
                  <span className={classes.quotaReset}>
                    {resetDisplay.absolute}
                    {resetDisplay?.relative && (
                      <>
                        <span className={classes.quotaResetRelative}>
                          {' '}
                          ({resetDisplay.relative})
                        </span>
                      </>
                    )}
                  </span>
                )}
              </div>
            </div>
            <QuotaMeter percent={remaining} classes={classes} index={index} />
          </div>
        );
      })}
    </>
  );
}