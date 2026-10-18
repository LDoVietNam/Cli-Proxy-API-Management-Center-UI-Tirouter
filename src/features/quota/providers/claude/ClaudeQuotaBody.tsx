/**
 * Claude 额度渲染体：套餐 chip 行 + 额度用量进度条
 */

import { useTranslation } from 'react-i18next';
import type { ClaudeQuotaState } from '@/types';
import { QuotaMeter } from '../../components/QuotaMeter';
import { buildResetDisplay, relativeTimeParts } from '@/utils/quota/relativeTime';
import type { QuotaBodyProps } from '../../types';
import { useNow } from '@/hooks/useNow';

export function ClaudeQuotaBody({ quota, classes, nowMs: nowMsProp }: QuotaBodyProps<ClaudeQuotaState> & { nowMs?: number }) {
  const { t } = useTranslation();
  // useNow (not Date.now default) — react-compiler lint: impure call in render.
  // Hook is called unconditionally; prop wins when provided.
  const now = useNow();
  const nowMs = nowMsProp ?? now;
  const windows = quota.windows ?? [];
  const extraUsage = quota.extraUsage ?? null;
  const planType = quota.planType ?? null;

  return (
    <>
      {planType && (
        <div className={classes.codexPlan}>
          <span className={classes.codexPlanLabel}>{t('claude_quota.plan_label')}</span>
          <span className={classes.codexPlanValue}>{t(`claude_quota.${planType}`)}</span>
        </div>
      )}
      {extraUsage && extraUsage.is_enabled && (
        <div className={classes.codexPlan}>
          <span className={classes.codexPlanLabel}>{t('claude_quota.extra_usage_label')}</span>
          <span className={classes.codexPlanValue}>
            {`$${(extraUsage.used_credits / 100).toFixed(2)} / $${(extraUsage.monthly_limit / 100).toFixed(2)}`}
          </span>
        </div>
      )}
      {windows.length === 0 ? (
        <div className={classes.quotaMessage}>{t('claude_quota.empty_windows')}</div>
      ) : (
        windows.map((window, index) => {
          const used = window.usedPercent;
          const clampedUsed = used === null ? null : Math.max(0, Math.min(100, used));
          const remaining =
            clampedUsed === null ? null : Math.max(0, Math.min(100, 100 - clampedUsed));
          const percentLabel = remaining === null ? '--' : `${Math.round(remaining)}%`;
          const windowLabel = window.labelKey ? t(window.labelKey) : window.label;

          // Build reset display with both absolute and relative time
          const resetDisplay = buildResetDisplay(
            window.resetLabel,
            window.resetAtMs,
            nowMs
          );

          // Check if reset is within the final hour (for quotaResetRelativeSoon class)
          const isResetSoon = window.resetAtMs !== null && window.resetAtMs !== undefined
            ? relativeTimeParts(window.resetAtMs, nowMs).unit === 'minute'
            : false;

          return (
            <div key={window.id} className={`${classes.quotaRow} ${isResetSoon ? classes.quotaResetRelativeSoon : ''}`}>
              <div className={classes.quotaRowHeader}>
                <span className={classes.quotaModel}>{windowLabel}</span>
                <div className={classes.quotaMeta}>
                  <span className={classes.quotaPercent}>{percentLabel}</span>
                  <span className={classes.quotaReset}>
                    {resetDisplay?.absolute}
                    {resetDisplay?.relative && (
                      <>
                        <span className={classes.quotaResetRelative}>
                          {' '}
                          ({resetDisplay.relative})
                        </span>
                      </>
                    )}
                  </span>
                </div>
              </div>
              <QuotaMeter percent={remaining} classes={classes} index={index} />
            </div>
          );
        })
      )}
    </>
  );
}