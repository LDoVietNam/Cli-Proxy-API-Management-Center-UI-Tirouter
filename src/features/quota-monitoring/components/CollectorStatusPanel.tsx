/**
 * Collector Status Panel
 * Displays quota tracker status including running state, interval, and tracked accounts
 */

import { useTranslation } from 'react-i18next';
import { IconPlay, IconPause, IconDatabase, IconClock, IconCheckCircle, IconAlertCircle, IconInfo } from '@/components/ui/icons';
import type { TrackerStatus } from '@/types/quotaMonitoring';
import styles from './CollectorStatusPanel.module.scss';

export type CollectorStatusPanelProps = {
  status: TrackerStatus;
};

export function CollectorStatusPanel({ status }: CollectorStatusPanelProps) {
  const { t } = useTranslation();

  const formatDuration = (durationStr: string) => {
    // duration is like "5m0s" from Go time.Duration.String()
    return durationStr.replace(/(\d+)m(\d+)s/, '$1m $2s').replace(/(\d+)h(\d+)m/, '$1h $2m').replace(/(\d+)h/, '$1h');
  };

  return (
    <div className={styles.panel}>
      {/* Status Header */}
      <div className={styles.statusHeader}>
        <div className={`${styles.statusIndicator} ${status.running ? styles.running : styles.stopped}`}>
          {status.running ? (
            <>
              <IconPlay size={16} className={styles.pulse} />
              <span className={styles.statusText}>{t('quota_monitoring.collector_running')}</span>
            </>
          ) : (
            <>
              <IconPause size={16} />
              <span className={styles.statusText}>{t('quota_monitoring.collector_stopped')}</span>
            </>
          )}
        </div>
      </div>

      {/* Config Info */}
      <div className={styles.configGrid}>
        <div className={styles.configItem}>
          <IconClock size={16} />
          <div className={styles.configInfo}>
            <span className={styles.configLabel}>{t('quota_monitoring.collection_interval')}</span>
            <span className={styles.configValue}>{formatDuration(status.interval)}</span>
          </div>
        </div>
        <div className={styles.configItem}>
          <IconDatabase size={16} />
          <div className={styles.configInfo}>
            <span className={styles.configLabel}>{t('quota_monitoring.tracked_accounts')}</span>
            <span className={styles.configValue}>{status.count}</span>
          </div>
        </div>
      </div>

      {/* Accounts List */}
      {status.accounts.length > 0 && (
        <div className={styles.accountsSection}>
          <h3 className={styles.sectionTitle}>{t('quota_monitoring.tracked_accounts_list')}</h3>
          <div className={styles.accountsList}>
            {status.accounts.map((account) => (
              <div key={`${account.provider}:${account.accountId}:${account.model}`} className={styles.accountItem}>
                <div className={styles.accountMain}>
                  <span className={styles.accountProvider}>{account.provider.toUpperCase()}</span>
                  <span className={styles.accountModel}>{account.model}</span>
                </div>
                <div className={styles.accountMeta}>
                  <span className={styles.accountId}>{account.accountId}</span>
                  <span className={`${styles.accountEnabled} ${account.enabled ? styles.enabled : styles.disabled}`}>
                    {account.enabled
                      ? <IconCheckCircle size={12} />
                      : <IconAlertCircle size={12} />}
                    {account.enabled ? t('quota_monitoring.enabled') : t('quota_monitoring.disabled')}
                  </span>
                  {account.authType && (
                    <span className={styles.accountAuthType}>
                      <IconInfo size={12} />
                      {account.authType}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {status.accounts.length === 0 && (
        <div className={styles.emptyState}>
          <IconDatabase size={32} />
          <p>{t('quota_monitoring.no_accounts_configured')}</p>
        </div>
      )}
    </div>
  );
}