/**
 * Quota Monitoring Dashboard Header
 * Shows summary stats and action buttons
 */

import { useTranslation } from 'react-i18next';
import { useCountUp } from '@/hooks/motion';
import { IconRefreshCw, IconPlay } from '@/components/ui/icons';
import { Button } from '@/components/ui/Button';
import styles from './QuotaMonitoringHeader.module.scss';

export type QuotaMonitoringHeaderProps = {
  totalCount: number;
  loadedCount: number;
  attentionCount: number;
  refreshing: boolean;
  disableControls: boolean;
  onRefreshAll: () => void;
  onForceCollection: () => void;
  forceCollecting: boolean;
};

export function QuotaMonitoringHeader(props: QuotaMonitoringHeaderProps) {
  const { totalCount, loadedCount, attentionCount, refreshing, disableControls, onRefreshAll, onForceCollection, forceCollecting } = props;
  const { t } = useTranslation();
  const displayLoadedCount = useCountUp(loadedCount);

  return (
    <header className={styles.header}>
      <div className={styles.copy}>
        <h1 className={styles.title} data-reveal>
          {t('quota_monitoring.title')}
        </h1>
        <p className={styles.meta} data-reveal>
          <span className={styles.metaTotal}>
            {t('quota_monitoring.meta_accounts', { count: totalCount })}
          </span>
          <span className={styles.metaDot} aria-hidden="true">
            ·
          </span>
          <span className={loadedCount > 0 ? styles.metaLoaded : styles.metaMuted}>
            {t('quota_monitoring.meta_loaded', { count: displayLoadedCount })}
          </span>
          {attentionCount > 0 && (
            <>
              <span className={styles.metaDot} aria-hidden="true">
                ·
              </span>
              <span className={styles.metaAttention}>
                {t('quota_monitoring.meta_attention', { count: attentionCount })}
              </span>
            </>
          )}
        </p>
      </div>
      <div className={styles.actions} data-reveal>
        <Button
          variant="primary"
          size="sm"
          onClick={onForceCollection}
          disabled={disableControls || forceCollecting}
          className={styles.forceAction}
        >
          {forceCollecting ? (
            <>
              <IconRefreshCw size={14} className={styles.spinning} />
              {t('quota_monitoring.collecting')}
            </>
          ) : (
            <>
              <IconPlay size={14} />
              {t('quota_monitoring.force_collection')}
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefreshAll}
          disabled={disableControls || refreshing}
          className={styles.refreshAction}
        >
          <IconRefreshCw size={14} className={refreshing ? styles.spinning : undefined} />
          {t('quota_monitoring.refresh_all')}
        </Button>
      </div>
    </header>
  );
}