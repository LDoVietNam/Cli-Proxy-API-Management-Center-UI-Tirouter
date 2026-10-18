/**
 * Quota Summary Widget
 * Displays high-level quota summary with provider breakdown
 */

import { useTranslation } from 'react-i18next';
import { IconCheckCircle, IconAlertCircle, IconHelpCircle, IconInfo } from '@/components/ui/icons';
import type { QuotaSummary } from '@/types/quotaMonitoring';
import styles from './QuotaSummaryWidget.module.scss';

type StatusKey = 'healthyCount' | 'warningCount' | 'criticalCount' | 'errorCount';

const STATUS_ORDER: StatusKey[] = ['healthyCount', 'warningCount', 'criticalCount', 'errorCount'];

const STATUS_CONFIG: Record<StatusKey, { labelKey: string; icon: React.ReactElement; className: string }> = {
  healthyCount: { labelKey: 'quota_monitoring.status_healthy', icon: <IconCheckCircle size={13} />, className: styles.healthy },
  warningCount: { labelKey: 'quota_monitoring.status_warning', icon: <IconAlertCircle size={13} />, className: styles.warning },
  criticalCount: { labelKey: 'quota_monitoring.status_critical', icon: <IconAlertCircle size={13} />, className: styles.critical },
  errorCount: { labelKey: 'quota_monitoring.status_error', icon: <IconHelpCircle size={13} />, className: styles.error },
};

export type QuotaSummaryWidgetProps = {
  summary: QuotaSummary;
};

export function QuotaSummaryWidget({ summary }: QuotaSummaryWidgetProps) {
  const { t } = useTranslation();

  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div className={styles.widget}>
      {/* Overall Stats */}
      <div className={styles.overallStats}>
        <div className={styles.statCard} data-tone="total">
          <span className={styles.statValue}>{formatNumber(summary.totalAccounts)}</span>
          <span className={styles.statLabel}>{t('quota_monitoring.total_accounts')}</span>
        </div>
        <div className={styles.statCard} data-tone="healthy">
          <span className={styles.statValue}>{formatNumber(summary.healthyAccounts)}</span>
          <span className={styles.statLabel}>{t('quota_monitoring.healthy_accounts')}</span>
        </div>
        <div className={styles.statCard} data-tone="warning">
          <span className={styles.statValue}>{formatNumber(summary.warningAccounts)}</span>
          <span className={styles.statLabel}>{t('quota_monitoring.warning_accounts')}</span>
        </div>
        <div className={styles.statCard} data-tone="critical">
          <span className={styles.statValue}>{formatNumber(summary.criticalAccounts)}</span>
          <span className={styles.statLabel}>{t('quota_monitoring.critical_accounts')}</span>
        </div>
        <div className={styles.statCard} data-tone="error">
          <span className={styles.statValue}>{formatNumber(summary.errorAccounts)}</span>
          <span className={styles.statLabel}>{t('quota_monitoring.error_accounts')}</span>
        </div>
      </div>

      {/* Provider Breakdown */}
      <div className={styles.providerBreakdown}>
        <h3 className={styles.breakdownTitle}>{t('quota_monitoring.by_provider')}</h3>
        <div className={styles.providerGrid}>
          {Object.entries(summary.byProvider).map(([providerKey, provider]) => (
            <div key={providerKey} className={styles.providerCard}>
              <div className={styles.providerHeader}>
                <span className={styles.providerName}>{provider.provider.toUpperCase()}</span>
                <span className={styles.providerAvgUsage}>
                  {t('quota_monitoring.avg_usage', { percent: provider.avgUsagePercent.toFixed(1) })}
                </span>
              </div>
              <div className={styles.providerStats}>
                {STATUS_ORDER.map((statusKey) => {
                  const count = provider[statusKey];
                  if (count === 0) return null;
                  const config = STATUS_CONFIG[statusKey];
                  return (
                    <div key={statusKey} className={`${styles.statusItem} ${config.className}`}>
                      {config.icon}
                      <span className={styles.statusLabel}>{t(config.labelKey)}</span>
                      <span className={styles.statusCount}>{count}</span>
                    </div>
                  );
                })}
              </div>
              <div className={styles.providerTotal}>
                {t('quota_monitoring.total', { count: provider.totalAccounts })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generated At */}
      <div className={styles.generatedAt}>
        <IconInfo size={12} />
        <span>
          {t('quota_monitoring.generated_at', { time: new Date(summary.generatedAt).toLocaleString() })}
        </span>
      </div>
    </div>
  );
}