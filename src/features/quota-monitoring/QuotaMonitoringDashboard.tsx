/**
 * Quota Monitoring Dashboard
 * Displays real-time quota snapshots, history charts, runway predictions,
 * summary statistics, and collector status from the /v0/management/quota-monitor/ API.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { quotaMonitoringApi } from '@/services/api/quotaMonitoring';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useRevealGroup } from '@/hooks/motion';
import { useAuthStore } from '@/stores';
import { QuotaSnapshotCard } from './components/QuotaSnapshotCard';
import { QuotaHistoryChart } from './components/QuotaHistoryChart';
import { RunwayPredictionCard } from './components/RunwayPredictionCard';
import { QuotaSummaryWidget } from './components/QuotaSummaryWidget';
import { CollectorStatusPanel } from './components/CollectorStatusPanel';
import { QuotaMonitoringHeader } from './components/QuotaMonitoringHeader';
import styles from './QuotaMonitoringDashboard.module.scss';

const REFRESH_INTERVAL_MS = 30000; // 30 seconds

export function QuotaMonitoringDashboard() {
  const { t } = useTranslation();
  const connectionStatus = useAuthStore((state) => state.connectionStatus);

  // State for each section
  const [snapshots, setSnapshots] = useState<QuotaSnapshot[]>([]);
  const [snapshotsLoading, setSnapshotsLoading] = useState(true);
  const [snapshotsError, setSnapshotsError] = useState<string | null>(null);

  const [history, setHistory] = useState<QuotaHistoryResponse | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [selectedHistoryKey, setSelectedHistoryKey] = useState<string | null>(null);

  const [predictions, setPredictions] = useState<RunwayPrediction[]>([]);
  const [predictionsLoading, setPredictionsLoading] = useState(true);
  const [predictionsError, setPredictionsError] = useState<string | null>(null);

  const [summary, setSummary] = useState<QuotaSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [trackerStatus, setTrackerStatus] = useState<TrackerStatus | null>(null);
  const [trackerStatusLoading, setTrackerStatusLoading] = useState(true);
  const [trackerStatusError, setTrackerStatusError] = useState<string | null>(null);

  const [forceCollecting, setForceCollecting] = useState(false);

  const disableControls = connectionStatus !== 'connected';

  const revealRef = useRevealGroup<HTMLDivElement>();

  // Load all data
  const loadSnapshots = useCallback(async () => {
    setSnapshotsLoading(true);
    setSnapshotsError(null);
    try {
      const data = await quotaMonitoringApi.getSnapshots();
      setSnapshots(data.snapshots);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('notification.refresh_failed');
      setSnapshotsError(message);
    } finally {
      setSnapshotsLoading(false);
    }
  }, [t]);

  const loadPredictions = useCallback(async () => {
    setPredictionsLoading(true);
    setPredictionsError(null);
    try {
      const data = await quotaMonitoringApi.getPredictions();
      setPredictions(data.predictions);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('notification.refresh_failed');
      setPredictionsError(message);
    } finally {
      setPredictionsLoading(false);
    }
  }, [t]);

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const data = await quotaMonitoringApi.getSummary();
      setSummary(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('notification.refresh_failed');
      setSummaryError(message);
    } finally {
      setSummaryLoading(false);
    }
  }, [t]);

  const loadTrackerStatus = useCallback(async () => {
    setTrackerStatusLoading(true);
    setTrackerStatusError(null);
    try {
      const data = await quotaMonitoringApi.getTrackerStatus();
      setTrackerStatus(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('notification.refresh_failed');
      setTrackerStatusError(message);
    } finally {
      setTrackerStatusLoading(false);
    }
  }, [t]);

  const loadAll = useCallback(async () => {
    await Promise.all([
      loadSnapshots(),
      loadPredictions(),
      loadSummary(),
      loadTrackerStatus(),
    ]);
  }, [loadSnapshots, loadPredictions, loadSummary, loadTrackerStatus]);

  const loadHistory = useCallback(async (provider: string, account: string, model: string) => {
    const key = `${provider}:${account}:${model}`;
    if (selectedHistoryKey === key && history) return;

    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await quotaMonitoringApi.getHistory(provider, account, model);
      setHistory(data);
      setSelectedHistoryKey(key);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('notification.refresh_failed');
      setHistoryError(message);
    } finally {
      setHistoryLoading(false);
    }
  }, [selectedHistoryKey, history, t]);

  const handleForceCollection = useCallback(async () => {
    setForceCollecting(true);
    try {
      await quotaMonitoringApi.forceCollection();
      await loadAll();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('notification.refresh_failed');
      setSnapshotsError(message);
    } finally {
      setForceCollecting(false);
    }
  }, [loadAll, t]);

  const handleRefreshAll = useCallback(async () => {
    await loadAll();
  }, [loadAll]);

  // Initial load
  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      void loadSnapshots();
      void loadPredictions();
      void loadSummary();
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [loadSnapshots, loadPredictions, loadSummary]);

  // Compute stats
  const stats = useMemo(() => {
    let loadedCount = 0;
    let attentionCount = 0;
    snapshots.forEach((snap) => {
      if (snap.status === 'healthy' || snap.status === 'warning') {
        loadedCount += 1;
      }
      if (snap.status === 'error' || snap.status === 'critical') {
        attentionCount += 1;
      }
    });
    return { loadedCount, attentionCount, totalCount: snapshots.length };
  }, [snapshots]);

  const anyLoading = snapshotsLoading || predictionsLoading || summaryLoading || trackerStatusLoading;

  return (
    <div className={styles.page} ref={revealRef}>
      <QuotaMonitoringHeader
        totalCount={stats.totalCount}
        loadedCount={stats.loadedCount}
        attentionCount={stats.attentionCount}
        refreshing={anyLoading || forceCollecting}
        disableControls={disableControls}
        onRefreshAll={handleRefreshAll}
        onForceCollection={handleForceCollection}
        forceCollecting={forceCollecting}
      />

      <section className={styles.workbench}>
        {/* Snapshots Grid */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle} data-reveal>{t('quota_monitoring.snapshots_title')}</h2>

          {snapshotsError && (
            <div className={styles.errorBanner} role="alert">
              {snapshotsError}
              <Button variant="ghost" size="sm" onClick={loadSnapshots}>
                {t('common.retry')}
              </Button>
            </div>
          )}

          {snapshotsLoading ? (
            <div className={styles.grid} aria-hidden="true">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} height={180} rounded={12} />
              ))}
            </div>
          ) : snapshots.length === 0 ? (
            <EmptyState
              title={t('quota_monitoring.empty_snapshots_title')}
              description={t('quota_monitoring.empty_snapshots_desc')}
              action={
                <Button variant="secondary" size="sm" onClick={loadSnapshots}>
                  {t('common.refresh')}
                </Button>
              }
            />
          ) : (
            <div className={styles.grid}>
              {snapshots.map((snapshot) => (
                <QuotaSnapshotCard
                  key={`${snapshot.provider}:${snapshot.account}:${snapshot.model}`}
                  snapshot={snapshot}
                  onViewHistory={() => loadHistory(snapshot.provider, snapshot.account, snapshot.model)}
                />
              ))}
            </div>
          )}
        </div>

        {/* History Chart */}
        {selectedHistoryKey && history && (
          <div className={styles.section}>
            <div className={styles.sectionHead}>
              <h3 className={styles.sectionTitle}>
                {t('quota_monitoring.history_title', {
                  provider: history.provider,
                  account: history.account,
                  model: history.model,
                })}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedHistoryKey(null);
                  setHistory(null);
                }}
              >
                {t('common.close')}
              </Button>
            </div>
            {historyLoading ? (
              <Skeleton height={300} rounded={12} />
            ) : historyError ? (
              <div className={styles.errorBanner} role="alert">
                {historyError}
              </div>
            ) : (
              <QuotaHistoryChart history={history} />
            )}
          </div>
        )}

        {/* Predictions Grid */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle} data-reveal>{t('quota_monitoring.predictions_title')}</h2>

          {predictionsError && (
            <div className={styles.errorBanner} role="alert">
              {predictionsError}
              <Button variant="ghost" size="sm" onClick={loadPredictions}>
                {t('common.retry')}
              </Button>
            </div>
          )}

          {predictionsLoading ? (
            <div className={styles.grid} aria-hidden="true">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} height={160} rounded={12} />
              ))}
            </div>
          ) : predictions.length === 0 ? (
            <EmptyState
              title={t('quota_monitoring.empty_predictions_title')}
              description={t('quota_monitoring.empty_predictions_desc')}
            />
          ) : (
            <div className={styles.grid}>
              {predictions.map((prediction) => (
                <RunwayPredictionCard key={`${prediction.provider}:${prediction.account}:${prediction.model}`} prediction={prediction} />
              ))}
            </div>
          )}
        </div>

        {/* Summary & Status Row */}
        <div className={styles.summaryRow}>
          <div className={styles.summarySection} data-reveal>
            <h2 className={styles.sectionTitle}>{t('quota_monitoring.summary_title')}</h2>
            {summaryLoading ? (
              <Skeleton height={200} rounded={12} />
            ) : summaryError ? (
              <div className={styles.errorBanner} role="alert">
                {summaryError}
                <Button variant="ghost" size="sm" onClick={loadSummary}>
                  {t('common.retry')}
                </Button>
              </div>
            ) : summary ? (
              <QuotaSummaryWidget summary={summary} />
            ) : (
              <EmptyState
                title={t('quota_monitoring.empty_summary_title')}
                description={t('quota_monitoring.empty_summary_desc')}
              />
            )}
          </div>

          <div className={styles.statusSection} data-reveal>
            <h2 className={styles.sectionTitle}>{t('quota_monitoring.collector_status_title')}</h2>
            {trackerStatusLoading ? (
              <Skeleton height={200} rounded={12} />
            ) : trackerStatusError ? (
              <div className={styles.errorBanner} role="alert">
                {trackerStatusError}
                <Button variant="ghost" size="sm" onClick={loadTrackerStatus}>
                  {t('common.retry')}
                </Button>
              </div>
            ) : trackerStatus ? (
              <CollectorStatusPanel status={trackerStatus} />
            ) : (
              <EmptyState
                title={t('quota_monitoring.empty_status_title')}
                description={t('quota_monitoring.empty_status_desc')}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// Import types locally to avoid circular imports
import type {
  QuotaSnapshot,
  QuotaHistoryResponse,
  RunwayPrediction,
  QuotaSummary,
  TrackerStatus,
} from '@/types/quotaMonitoring';