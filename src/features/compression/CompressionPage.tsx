import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { tirouterApi } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import type { CompressionStatsResponse, CavemanConfig, RTKConfig } from '@/types';
import styles from './CompressionPage.module.scss';

type TabId = 'overview' | 'caveman' | 'rtk';

export function CompressionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState<CompressionStatsResponse | null>(null);
  const [cavemanConfig, setCavemanConfig] = useState<CavemanConfig>({ enabled: false, level: 'lite' });
  const [rtkConfig, setRtkConfig] = useState<RTKConfig>({ enabled: false, binary: '', 'ultra-mode': false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const loadData = async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const [statsRes, cavemanRes, rtkRes] = await Promise.all([
        tirouterApi.getCompressionStats(),
        tirouterApi.getCavemanConfig(),
        tirouterApi.getRTKConfig(),
      ]);
      setStats(statsRes);
      setCavemanConfig(cavemanRes);
      setRtkConfig(rtkRes);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setLoadError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    loadData();
  }, [isAuthenticated, navigate]);

  const handleCavemanSave = async () => {
    setSaving('caveman');
    setSaveError(null);
    try {
      await tirouterApi.updateCavemanConfig(cavemanConfig);
      await loadData();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(null);
    }
  };

  const handleRTKSave = async () => {
    setSaving('rtk');
    setSaveError(null);
    try {
      await tirouterApi.updateRTKConfig(rtkConfig);
      await loadData();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const enabledLabel = t('common.enabled_status', 'Enabled');
  const disabledLabel = t('common.disabled_status', 'Disabled');

  if (loading) {
    return (
      <div className={styles['compression-page']}>
        <div className={styles['page-header']}>
          <h1>{t('nav.compression', 'Compression')}</h1>
        </div>
        <div className={styles.loading}>
          <LoadingSpinner />
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (loadError && !stats) {
    return (
      <div className={styles['compression-page']}>
        <div className={styles['page-header']}>
          <h1>{t('nav.compression', 'Compression')}</h1>
        </div>
        <div className={styles['error-box']} role="alert">
          <span className={styles['error-message']}>
            {t('compression.load_error', 'Failed to load compression data')}: {loadError}
          </span>
          <Button variant="primary" size="sm" onClick={() => void loadData()}>
            {t('common.retry', 'Retry')}
          </Button>
        </div>
      </div>
    );
  }

  const caveman = stats?.caveman || { enabled: false, level: 'lite', savings: {} };
  const rtk = stats?.rtk || { enabled: false, stats: [] };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: t('compression.overview', 'Overview') },
    { id: 'caveman', label: t('compression.caveman', 'Caveman') },
    { id: 'rtk', label: t('compression.rtk', 'RTK') },
  ];

  return (
    <div className={styles['compression-page']}>
      <div className={styles['page-header']}>
        <h1>{t('nav.compression', 'Compression')}</h1>
        <p className={styles['page-description']}>
          {t(
            'compression.description',
            'Monitor Caveman text compression and RTK token reduction statistics'
          )}
        </p>
      </div>

      <div className={styles.tabs} role="tablist" aria-label={t('nav.compression', 'Compression')}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`compression-tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`compression-panel-${tab.id}`}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loadError && (
        <div className={styles['error-box']} role="alert">
          <span className={styles['error-message']}>
            {t('compression.load_error', 'Failed to load compression data')}: {loadError}
          </span>
          <Button variant="primary" size="sm" onClick={() => void loadData()}>
            {t('common.retry', 'Retry')}
          </Button>
        </div>
      )}

      {saveError && (
        <div className={styles['error-box']} role="alert">
          <span className={styles['error-message']}>
            {t('compression.save_error', 'Failed to save configuration')}: {saveError}
          </span>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className={styles['overview-grid']} role="tabpanel" id="compression-panel-overview" aria-labelledby="compression-tab-overview">
          <div className={`${styles['stat-card']} ${styles.caveman}`}>
            <div className={styles['stat-header']}>
              <span className={styles['stat-icon']} aria-hidden="true">{caveman.enabled ? '✓' : '✗'}</span>
              <span className={styles['stat-title']}>{t('compression.caveman', 'Caveman')}</span>
            </div>
            <div className={styles['stat-value']}>{caveman.enabled ? enabledLabel : disabledLabel}</div>
            <div className={styles['stat-sub']}>{t('compression.level', 'Level')}: {caveman.level}</div>
            {caveman.savings && (
              <div className={styles['stat-metrics']}>
                <div className={styles.metric}>
                  <span className={styles['metric-label']}>{t('compression.total_requests', 'Requests')}</span>
                  <span className={styles['metric-value']}>{formatNumber(caveman.savings.total_requests || 0)}</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles['metric-label']}>{t('compression.savings_percent', 'Savings')}</span>
                  <span className={`${styles['metric-value']} ${styles.success}`}>
                    {caveman.savings.total_savings_percent?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className={styles.metric}>
                  <span className={styles['metric-label']}>{t('compression.input_chars', 'Input')}</span>
                  <span className={styles['metric-value']}>{formatBytes(caveman.savings.total_input_chars || 0)}</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles['metric-label']}>{t('compression.output_chars', 'Output')}</span>
                  <span className={styles['metric-value']}>{formatBytes(caveman.savings.total_output_chars || 0)}</span>
                </div>
              </div>
            )}
          </div>

          <div className={`${styles['stat-card']} ${styles.rtk}`}>
            <div className={styles['stat-header']}>
              <span className={styles['stat-icon']} aria-hidden="true">{rtk.enabled ? '✓' : '✗'}</span>
              <span className={styles['stat-title']}>{t('compression.rtk', 'RTK')}</span>
            </div>
            <div className={styles['stat-value']}>{rtk.enabled ? enabledLabel : disabledLabel}</div>
            <div className={styles['stat-sub']}>
              {t('compression.ultra_mode', 'Ultra Mode')}: {rtkConfig['ultra-mode'] ? enabledLabel : disabledLabel}
            </div>
            {rtk.stats && rtk.stats.length > 0 && (
              <div className={styles['stat-metrics']}>
                <div className={styles.metric}>
                  <span className={styles['metric-label']}>{t('compression.commands', 'Commands')}</span>
                  <span className={styles['metric-value']}>{rtk.stats.length}</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles['metric-label']}>{t('compression.total_time', 'Total Time')}</span>
                  <span className={styles['metric-value']}>
                    {rtk.stats.reduce((sum, s) => sum + (s.total_time_ms || 0), 0)}ms
                  </span>
                </div>
                <div className={styles.metric}>
                  <span className={styles['metric-label']}>{t('compression.avg_time', 'Avg Time')}</span>
                  <span className={styles['metric-value']}>
                    {Math.round(rtk.stats.reduce((sum, s) => sum + (s.avg_time_ms || 0), 0) / rtk.stats.length)}ms
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'caveman' && (
        <div
          className={styles['config-section']}
          role="tabpanel"
          id="compression-panel-caveman"
          aria-labelledby="compression-tab-caveman"
        >
          <h2>{t('compression.caveman_config', 'Caveman Configuration')}</h2>
          <div className={styles['config-form']}>
            <div className={styles['toggle-row']}>
              <ToggleSwitch
                checked={cavemanConfig.enabled}
                onChange={(value) => setCavemanConfig((prev) => ({ ...prev, enabled: value }))}
                label={t('compression.enabled', 'Enabled')}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="caveman-level">
                {t('compression.level', 'Compression Level')}
              </label>
              <select
                id="caveman-level"
                className={styles.select}
                value={cavemanConfig.level}
                onChange={(e) => setCavemanConfig((prev) => ({ ...prev, level: e.target.value }))}
                disabled={!cavemanConfig.enabled}
              >
                <option value="lite">{t('compression.level_lite', 'Lite')}</option>
                <option value="full">{t('compression.level_full', 'Full')}</option>
                <option value="ultra">{t('compression.level_ultra', 'Ultra')}</option>
              </select>
            </div>
            <Button
              variant="primary"
              onClick={() => void handleCavemanSave()}
              loading={saving === 'caveman'}
            >
              {saving === 'caveman' ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'rtk' && (
        <div
          className={styles['config-section']}
          role="tabpanel"
          id="compression-panel-rtk"
          aria-labelledby="compression-tab-rtk"
        >
          <h2>{t('compression.rtk_config', 'RTK Configuration')}</h2>
          <div className={styles['config-form']}>
            <div className={styles['toggle-row']}>
              <ToggleSwitch
                checked={rtkConfig.enabled}
                onChange={(value) => setRtkConfig((prev) => ({ ...prev, enabled: value }))}
                label={t('compression.enabled', 'Enabled')}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="rtk-binary">
                {t('compression.binary', 'Binary Path')}
              </label>
              <input
                className="input"
                type="text"
                id="rtk-binary"
                value={rtkConfig.binary}
                onChange={(e) => setRtkConfig((prev) => ({ ...prev, binary: e.target.value }))}
                placeholder="/path/to/rtk"
                disabled={!rtkConfig.enabled}
              />
            </div>
            <div className={styles['toggle-row']}>
              <ToggleSwitch
                checked={rtkConfig['ultra-mode']}
                onChange={(value) => setRtkConfig((prev) => ({ ...prev, 'ultra-mode': value }))}
                label={t('compression.ultra_mode', 'Ultra Mode')}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="rtk-timeout">
                {t('compression.timeout', 'Timeout')}
              </label>
              <input
                className="input"
                type="text"
                id="rtk-timeout"
                value={rtkConfig.timeout || ''}
                onChange={(e) => setRtkConfig((prev) => ({ ...prev, timeout: e.target.value }))}
                placeholder="30s"
                disabled={!rtkConfig.enabled}
              />
            </div>
            <Button
              variant="primary"
              onClick={() => void handleRTKSave()}
              loading={saving === 'rtk'}
            >
              {saving === 'rtk' ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'overview' && rtk.stats && rtk.stats.length > 0 && (
        <div className={styles['table-section']}>
          <h2>{t('compression.rtk_details', 'RTK Command Details')}</h2>
          <div className={styles['table-wrapper']}>
            <table>
              <thead>
                <tr>
                  <th>{t('compression.name', 'Name')}</th>
                  <th>{t('compression.count', 'Count')}</th>
                  <th>{t('compression.total_time', 'Total Time')}</th>
                  <th>{t('compression.avg_time', 'Avg Time')}</th>
                  <th>{t('compression.min_time', 'Min Time')}</th>
                  <th>{t('compression.max_time', 'Max Time')}</th>
                </tr>
              </thead>
              <tbody>
                {rtk.stats.map((stat, i) => (
                  <tr key={i}>
                    <td className={styles['font-mono']}>{stat.name}</td>
                    <td>{formatNumber(stat.count)}</td>
                    <td>{stat.total_time_ms}ms</td>
                    <td>{stat.avg_time_ms}ms</td>
                    <td>{stat.min_time_ms}ms</td>
                    <td>{stat.max_time_ms}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
