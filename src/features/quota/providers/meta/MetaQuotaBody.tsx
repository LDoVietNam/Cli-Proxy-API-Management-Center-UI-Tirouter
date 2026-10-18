import { useTranslation } from 'react-i18next';
import type { MetaQuotaState } from '@/types';
import { useNow } from '@/hooks/useNow';
import { buildResetDisplay } from '@/utils/quota';
import { QuotaMeter } from '../../components/QuotaMeter';
import { QuotaResetLabel } from '../../components/QuotaResetLabel';
import type { QuotaBodyProps } from '../../types';

export function MetaQuotaBody({ quota, classes }: QuotaBodyProps<MetaQuotaState>) {
  const { t, i18n } = useTranslation();
  const now = useNow();
  const locale = i18n.resolvedLanguage;

  if (quota.status === 'loading') {
    return <div className={classes.quotaMessage}>{t('meta_quota.loading')}</div>;
  }
  if (quota.status === 'error') {
    return <div className={classes.quotaMessage}>{quota.error || t('meta_quota.error')}</div>;
  }
  // Handle both quota.windows and quota.data?.windows
  const windows = quota.windows ?? quota.data?.windows ?? [];
  // Show window labels as hints even when there's no data
  if (windows.length === 0) {
    return (
      <div className={classes.quotaMessage}>
        {t('meta_quota.empty_data')}
        <div className={classes.hint}>
          {t('meta_quota.window')}, {t('meta_quota.weekly')}
        </div>
        <div className={classes.hint}>{t('meta_quota.unknown')}</div>
      </div>
    );
  }
  if (windows.every((window) => window.usedPercent === null)) {
    return (
      <div className={classes.quotaMessage}>
        {t('meta_quota.empty_data')}
        <div className={classes.hint}>
          {t('meta_quota.window')}, {t('meta_quota.weekly')}
        </div>
        <div className={classes.hint}>{t('meta_quota.unknown')}</div>
      </div>
    );
  }

  // Display plan name if available, otherwise fall back to window-based labels
  const planName = quota.planType ? t(quota.planType) : quota.data?.planName ? t(quota.data.planName) : null;

  return (
    <>
      {planName && (
        <div className={classes.planName}>
          <span className={classes.planNameLabel}>{t('meta_quota.plan_label')}</span>
          <span className={classes.planNameValue}>{planName}</span>
        </div>
      )}
      {quota.isSubscriptionActive && (
        <div className={classes.subscriptionActive}>
          {t('meta_quota.active')}
        </div>
      )}
      {windows.map((window, index) => {
        const remaining = window.usedPercent === null ? null : 100 - window.usedPercent;
        const resetDisplay = buildResetDisplay(window.resetLabel, window.resetAtMs, now, locale);
        const label = t(`meta_quota.${window.id}`);
        return (
          <div key={window.id} className={classes.quotaRow}>
            <div className={classes.quotaRowHeader}>
              <span className={classes.quotaModel}>{label}</span>
              <div className={classes.quotaMeta}>
                <span className={classes.quotaPercent}>
                  {remaining === null
                    ? t('meta_quota.unknown')
                    : t('meta_quota.remaining', { percent: Number(remaining.toFixed(1)) })}
                </span>
                {resetDisplay && (
                  <QuotaResetLabel display={resetDisplay} classes={classes} />
                )}
              </div>
            </div>
            <div
              role={remaining === null ? undefined : 'meter'}
              aria-label={remaining === null ? undefined : label}
              aria-valuemin={remaining === null ? undefined : 0}
              aria-valuemax={remaining === null ? undefined : 100}
              aria-valuenow={remaining ?? undefined}
            >
              <QuotaMeter percent={remaining} classes={classes} index={index} />
            </div>
          </div>
        );
      })}
    </>
  );
}
