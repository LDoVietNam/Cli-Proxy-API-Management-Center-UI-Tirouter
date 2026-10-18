/**
 * Quota Snapshot Card
 * Displays a single quota snapshot with status, usage bar, and actions
 */

import { useTranslation } from 'react-i18next';
import { IconRefreshCw, IconHistory } from '@/components/ui/icons';
import { Button } from '@/components/ui/Button';
import type { QuotaSnapshot } from '@/types/quotaMonitoring';
import styles from './QuotaSnapshotCard.module.scss';

export type QuotaSnapshotCardProps = {
  snapshot: QuotaSnapshot;
  onViewHistory: () => void;
};

export function QuotaSnapshotCard({ snapshot, onViewHistory }: QuotaSnapshotCardProps) {
  const { t } = useTranslation();

  const usagePercent = snapshot.limit > 0 ? (snapshot.used / snapshot.limit) * 100 : 0;
  const isCritical = usagePercent >= 90 || snapshot.status === 'critical';
  const isWarning = usagePercent >= 70 || snapshot.status === 'warning';
  const isError = snapshot.status === 'error';

  const getStatusLabel = () => {
    switch (snapshot.status) {
      case 'healthy':
        return t('quota_monitoring.status_healthy');
      case 'warning':
        return t('quota_monitoring.status_warning');
      case 'critical':
        return t('quota_monitoring.status_critical');
      case 'error':
        return t('quota_monitoring.status_error');
      default:
        return t('quota_monitoring.status_unknown');
    }
  };

  const getStatusClass = () => {
    if (isError) return styles.statusError;
    if (isCritical) return styles.statusCritical;
    if (isWarning) return styles.statusWarning;
    return styles.statusHealthy;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString();
    } catch {
      return isoString;
    }
  };

  return (
    <article className={`${styles.card} ${getStatusClass()}`}>
      <header className={styles.header}>
        <div className={styles.providerInfo}>
          <span className={styles.providerBadge}>{snapshot.provider.toUpperCase()}</span>
          <span className={styles.modelName}>{snapshot.model}</span>
        </div>
        <span className={`${styles.statusBadge} ${getStatusClass()}`}>
          {getStatusLabel()}
        </span>
      </header>

      <div className={styles.body}>
        <div className={styles.usageSection}>
          <div className={styles.usageBar}>
            <div
              className={styles.usageFill}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
          <div className={styles.usageLabels}>
            <span className={styles.usedLabel}>
              {t('quota_monitoring.used', { used: formatNumber(snapshot.used) })}
            </span>
            <span className={styles.limitLabel}>
              {t('quota_monitoring.limit', { limit: formatNumber(snapshot.limit) })}
            </span>
          </div>
          <div className={styles.usagePercent}>
            {usagePercent.toFixed(1)}%
          </div>
        </div>

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{t('quota_monitoring.unit')}</span>
            <span className={styles.detailValue}>{snapshot.unit}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{t('quota_monitoring.reset_time')}</span>
            <span className={styles.detailValue}>{formatTime(snapshot.resetTime)}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{t('quota_monitoring.collected_at')}</span>
            <span className={styles.detailValue}>{formatTime(snapshot.collectedAt)}</span>
          </div>
          {snapshot.errorMessage && (
            <div className={styles.errorMessage}>
              <span className={styles.errorLabel}>{t('quota_monitoring.error')}</span>
              <span className={styles.errorText}>{snapshot.errorMessage}</span>
            </div>
          )}
        </div>
      </div>

      <footer className={styles.actions}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewHistory}
          className={styles.historyAction}
        >
          <IconHistory size={13} />
          {t('quota_monitoring.view_history')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={styles.refreshAction}
        >
          <IconRefreshCw size={13} />
          {t('quota_monitoring.refresh')}
        </Button>
      </footer>
    </article>
  );
}