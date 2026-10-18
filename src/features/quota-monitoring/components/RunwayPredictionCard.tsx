/**
 * Runway Prediction Card
 * Displays runway prediction with hours remaining, depletion time, and confidence
 */

import { useTranslation } from 'react-i18next';
import { IconClock, IconTrendingDown, IconAlertCircle, IconCheckCircle, IconHelpCircle } from '@/components/ui/icons';
import type { RunwayPrediction } from '@/types/quotaMonitoring';
import styles from './RunwayPredictionCard.module.scss';

export type RunwayPredictionCardProps = {
  prediction: RunwayPrediction;
};

export function RunwayPredictionCard({ prediction }: RunwayPredictionCardProps) {
  const { t } = useTranslation();

  const isCritical = prediction.status === 'critical' || (prediction.hoursRemaining !== null && prediction.hoursRemaining < 24);
  const isWarning = prediction.status === 'warning' || (prediction.hoursRemaining !== null && prediction.hoursRemaining < 72);
  const isError = prediction.status === 'error';
  const isUnknown = prediction.hoursRemaining === null;

  const getStatusConfig = () => {
    if (isError) {
      return { label: t('quota_monitoring.status_error'), className: styles.statusError, icon: <IconAlertCircle size={14} /> };
    }
    if (isCritical) {
      return { label: t('quota_monitoring.status_critical'), className: styles.statusCritical, icon: <IconAlertCircle size={14} /> };
    }
    if (isWarning) {
      return { label: t('quota_monitoring.status_warning'), className: styles.statusWarning, icon: <IconTrendingDown size={14} /> };
    }
    if (isUnknown) {
      return { label: t('quota_monitoring.status_unknown'), className: styles.statusUnknown, icon: <IconHelpCircle size={14} /> };
    }
    return { label: t('quota_monitoring.status_healthy'), className: styles.statusHealthy, icon: <IconCheckCircle size={14} /> };
  };

  const status = getStatusConfig();

  const formatHours = (hours: number | null) => {
    if (hours === null) return t('quota_monitoring.unknown');
    if (hours < 1) return `${Math.round(hours * 60)} ${t('quota_monitoring.minutes_short')}`;
    if (hours < 24) return `${hours.toFixed(1)} ${t('quota_monitoring.hours_short')}`;
    if (hours < 168) return `${(hours / 24).toFixed(1)} ${t('quota_monitoring.days_short')}`;
    return `${(hours / 168).toFixed(1)} ${t('quota_monitoring.weeks_short')}`;
  };

  const formatDepletionTime = (isoString: string | null) => {
    if (!isoString) return t('quota_monitoring.unknown');
    try {
      const date = new Date(isoString);
      const now = new Date();
      if (date < now) return t('quota_monitoring.depleted');
      return date.toLocaleString();
    } catch {
      return isoString;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(1);
  };

  const confidencePercent = Math.round(prediction.confidence * 100);

  return (
    <article className={`${styles.card} ${status.className}`}>
      <header className={styles.header}>
        <div className={styles.providerInfo}>
          <span className={styles.providerBadge}>{prediction.provider.toUpperCase()}</span>
          <span className={styles.modelName}>{prediction.model}</span>
        </div>
        <span className={`${styles.statusBadge} ${status.className}`}>
          {status.icon}
          {status.label}
        </span>
      </header>

      <div className={styles.body}>
        <div className={styles.mainMetric}>
          <div className={styles.metricValue}>
            {isUnknown ? (
              <span className={styles.unknown}>{t('quota_monitoring.unknown')}</span>
            ) : (
              <>
                <IconClock size={32} className={styles.clockIcon} />
                <span className={styles.hoursRemaining}>{formatHours(prediction.hoursRemaining)}</span>
              </>
            )}
          </div>
          <div className={styles.metricLabel}>
            {t('quota_monitoring.hours_remaining')}
          </div>
        </div>

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{t('quota_monitoring.depletion_time')}</span>
            <span className={styles.detailValue}>{formatDepletionTime(prediction.depletionTime)}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{t('quota_monitoring.current_usage')}</span>
            <span className={styles.detailValue}>{prediction.currentUsagePercent.toFixed(1)}%</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{t('quota_monitoring.consumption_rate')}</span>
            <span className={styles.detailValue}>
              {formatNumber(prediction.consumptionRatePerHour)} {t('quota_monitoring.per_hour')}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{t('quota_monitoring.confidence')}</span>
            <span className={styles.detailValue}>
              <div className={styles.confidenceBar}>
                <div
                  className={styles.confidenceFill}
                  style={{ width: `${confidencePercent}%` }}
                />
              </div>
              {confidencePercent}%
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{t('quota_monitoring.data_points')}</span>
            <span className={styles.detailValue}>{prediction.dataPoints}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{t('quota_monitoring.last_updated')}</span>
            <span className={styles.detailValue}>
              {new Date(prediction.lastUpdated).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <span className={styles.accountInfo}>
          {t('quota_monitoring.account', { account: prediction.account })}
        </span>
      </footer>
    </article>
  );
}