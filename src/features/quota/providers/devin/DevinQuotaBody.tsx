import { useTranslation } from 'react-i18next';
import type { DevinQuotaState } from '@/types';
import { useNow } from '@/hooks/useNow';
import { buildResetDisplay } from '@/utils/quota';
import { QuotaMeter } from '../../components/QuotaMeter';
import { QuotaResetLabel } from '../../components/QuotaResetLabel';
import type { QuotaBodyProps } from '../../types';

export function DevinQuotaBody({ quota, classes }: QuotaBodyProps<DevinQuotaState>) {
  const { t, i18n } = useTranslation();
  const now = useNow();
  const locale = i18n.resolvedLanguage;

  return (
    <>
      {quota.windows.map((window, index) => {
        const reset = buildResetDisplay(window.resetLabel, window.resetAtMs, now, locale);
        const label = t(`devin_quota.${window.id}`);
        return (
          <div key={window.id} className={classes.quotaRow}>
            <div className={classes.quotaRowHeader}>
              <span className={classes.quotaModel}>{label}</span>
              <div className={classes.quotaMeta}>
                <span className={classes.quotaPercent}>
                  {window.usedPercent === null
                    ? t('devin_quota.unavailable')
                    : `${100 - window.usedPercent}%`}
                </span>
                {reset ? (
                  <QuotaResetLabel display={reset} classes={classes} />
                ) : (
                  <span className={classes.quotaReset}>{t('devin_quota.reset_unknown')}</span>
                )}
              </div>
            </div>
            <div
              role={window.usedPercent === null ? undefined : 'meter'}
              aria-label={window.usedPercent === null ? undefined : label}
              aria-valuemin={window.usedPercent === null ? undefined : 0}
              aria-valuemax={window.usedPercent === null ? undefined : 100}
              aria-valuenow={window.usedPercent === null ? undefined : 100 - (window.usedPercent ?? 0)}
            >
              <QuotaMeter percent={window.usedPercent === null ? null : 100 - window.usedPercent} classes={classes} index={index} />
            </div>
          </div>
        );
      })}
    </>
  );
}
