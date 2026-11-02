import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { tirouterApi } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import type { RTKConfig } from '@/types';
import styles from './RTKConfigPage.module.scss';

export function RTKConfigPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [config, setConfig] = useState<RTKConfig>({
    enabled: false,
    binary: '',
    'ultra-mode': false,
    'pool-size': '',
    timeout: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadConfig = async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const res = await tirouterApi.getRTKConfig();
      setConfig(res);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    loadConfig();
  }, [isAuthenticated, navigate]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await tirouterApi.updateRTKConfig(config);
      await loadConfig();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles['rtk-config-page']}>
        <div className={styles['page-header']}>
          <h1>{t('nav.rtk_config', 'RTK Config')}</h1>
        </div>
        <div className={styles.loading}>
          <LoadingSpinner />
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['rtk-config-page']}>
      <div className={styles['page-header']}>
        <h1>{t('nav.rtk_config', 'RTK Config')}</h1>
        <p className={styles['page-description']}>
          {t(
            'rtk.description',
            'Configure Request Token Keeper (RTK) for token reduction and command filtering'
          )}
        </p>
      </div>

      {loadError && (
        <div className={styles['error-box']} role="alert">
          <span className={styles['error-message']}>
            {t('rtk.load_error', 'Failed to load RTK config')}: {loadError}
          </span>
          <Button variant="primary" size="sm" onClick={() => void loadConfig()}>
            {t('common.retry', 'Retry')}
          </Button>
        </div>
      )}

      <div className={styles['config-card']}>
        <div className="form-group">
          <div className={styles['toggle-row']}>
            <ToggleSwitch
              checked={config.enabled}
              onChange={(value) => setConfig((prev) => ({ ...prev, enabled: value }))}
              label={t('compression.enabled', 'Enabled')}
            />
          </div>
          <p className={styles['form-hint']}>
            {t('rtk.enabled_hint', 'Enable RTK command filtering for token reduction')}
          </p>
        </div>

        <div className="form-group">
          <label className={styles['form-label']} htmlFor="rtk-binary">
            {t('compression.binary', 'Binary Path')}
          </label>
          <input
            className={styles.input}
            type="text"
            id="rtk-binary"
            value={config.binary}
            onChange={(e) => setConfig((prev) => ({ ...prev, binary: e.target.value }))}
            placeholder="/path/to/rtk"
            disabled={!config.enabled}
          />
          <p className={styles['form-hint']}>
            {t('rtk.binary_hint', 'Path to the RTK binary executable')}
          </p>
        </div>

        <div className="form-group">
          <label className={styles['form-label']} htmlFor="rtk-pool-size">
            {t('rtk.pool_size', 'Pool Size')}
          </label>
          <input
            className={styles.input}
            type="text"
            id="rtk-pool-size"
            value={config['pool-size'] || ''}
            onChange={(e) => setConfig((prev) => ({ ...prev, 'pool-size': e.target.value }))}
            placeholder="4"
            disabled={!config.enabled}
          />
          <p className={styles['form-hint']}>
            {t('rtk.pool_size_hint', 'Number of reusable RTK worker processes (empty uses the binary default)')}
          </p>
        </div>

        <div className="form-group">
          <div className={styles['toggle-row']}>
            <ToggleSwitch
              checked={config['ultra-mode']}
              onChange={(value) => setConfig((prev) => ({ ...prev, 'ultra-mode': value }))}
              disabled={!config.enabled}
              label={t('compression.ultra_mode', 'Ultra Mode')}
            />
          </div>
          <p className={styles['form-hint']}>
            {t('rtk.ultra_hint', 'Enable ultra-compact output filtering')}
          </p>
        </div>

        <div className="form-group">
          <label className={styles['form-label']} htmlFor="rtk-timeout">
            {t('compression.timeout', 'Timeout')}
          </label>
          <input
            className={styles.input}
            type="text"
            id="rtk-timeout"
            value={config.timeout || ''}
            onChange={(e) => setConfig((prev) => ({ ...prev, timeout: e.target.value }))}
            placeholder="30s"
            disabled={!config.enabled}
          />
          <p className={styles['form-hint']}>
            {t('rtk.timeout_hint', 'Maximum duration for RTK command execution (e.g., 30s, 1m)')}
          </p>
        </div>

        <Button variant="primary" onClick={() => void handleSave()} loading={saving}>
          {saving ? t('common.saving') : t('common.save')}
        </Button>
      </div>

      {saveError && (
        <div className={styles['error-box']} role="alert">
          <span className={styles['error-message']}>
            {t('rtk.save_error', 'Failed to save RTK config')}: {saveError}
          </span>
        </div>
      )}

      <div className={styles['info-section']}>
        <h2>{t('rtk.about', 'About RTK')}</h2>
        <p>
          {t(
            'rtk.about_text',
            'RTK (Request Token Keeper) is a binary tool that filters and reduces token usage in API requests and responses. It can significantly reduce token consumption by removing redundant information while preserving essential content.'
          )}
        </p>
        <ul>
          <li>{t('rtk.feature_1', 'Reduces token usage by filtering unnecessary content')}</li>
          <li>{t('rtk.feature_2', 'Supports ultra-mode for maximum compression')}</li>
          <li>{t('rtk.feature_3', 'Configurable timeout for command execution')}</li>
          <li>{t('rtk.feature_4', 'Works with Caveman for layered compression')}</li>
        </ul>
      </div>
    </div>
  );
}

export default RTKConfigPage;
