import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { tirouterApi } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import type { PromptsConfig, PromptPreset, PromptInject } from '@/types';
import styles from './PromptsConfigPage.module.scss';

const emptyPreset: PromptPreset = {
  name: '',
  models: [],
  match: [],
  'not-match': [],
  inject: { system: '', 'system-mode': 'merge', 'prepend-user': '', 'append-user': '' },
};

const emptyInject: PromptInject = {
  system: '',
  'system-mode': 'merge',
  'prepend-user': '',
  'append-user': '',
};

export function PromptsConfigPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [config, setConfig] = useState<PromptsConfig>({ enabled: false, presets: [], default: emptyInject });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadConfig = async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const res = await tirouterApi.getPromptsConfig();
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
      await tirouterApi.updatePromptsConfig(config);
      await loadConfig();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  };

  const addPreset = () => {
    setConfig(prev => ({ ...prev, presets: [...prev.presets, { ...emptyPreset, name: `Preset ${prev.presets.length + 1}` }] }));
  };

  const removePreset = (index: number) => {
    setConfig(prev => ({ ...prev, presets: prev.presets.filter((_, i) => i !== index) }));
  };

  const updatePreset = (index: number, preset: PromptPreset) => {
    setConfig(prev => {
      const newPresets = [...prev.presets];
      newPresets[index] = preset;
      return { ...prev, presets: newPresets };
    });
  };

  if (loading) {
    return (
      <div className={styles['prompts-config-page']}>
        <div className={styles['page-header']}>
          <h1>{t('nav.prompts_config', 'Prompts Config')}</h1>
        </div>
        <div className={styles.loading}>
          <LoadingSpinner />
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['prompts-config-page']}>
      <div className={styles['page-header']}>
        <h1>{t('nav.prompts_config', 'Prompts Config')}</h1>
        <p className={styles['page-description']}>
          {t('prompts.description', 'Configure automatic prompt injection presets for model requests')}
        </p>
      </div>

      {loadError && (
        <div className={styles['error-box']} role="alert">
          <span className={styles['error-message']}>
            {t('prompts.load_error', 'Failed to load Prompts config')}: {loadError}
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
              onChange={(value) => setConfig(prev => ({ ...prev, enabled: value }))}
              label={t('compression.enabled', 'Enabled')}
            />
          </div>
        </div>

        <div className={styles['section-divider']} />

        <div className="form-group">
          <div className={styles['section-header']}>
            <h3>{t('prompts.presets', 'Presets')}</h3>
            <Button variant="secondary" size="sm" onClick={addPreset} disabled={!config.enabled}>
              {t('prompts.add_preset', '+ Add Preset')}
            </Button>
          </div>

          {config.enabled ? (
            config.presets.length === 0 ? (
              <EmptyState
                title={t('prompts.no_presets_title', 'No presets configured')}
                description={t(
                  'prompts.no_presets_desc',
                  'Presets inject prompts into requests matching model patterns. Create one to get started.'
                )}
                action={
                  <Button variant="primary" size="sm" onClick={addPreset}>
                    {t('prompts.add_preset', '+ Add Preset')}
                  </Button>
                }
              />
            ) : (
              config.presets.map((preset, index) => (
                <div key={index} className={styles['preset-card']}>
                  <div className={styles['preset-header']}>
                    <input
                      className={styles['preset-name-input']}
                      type="text"
                      value={preset.name}
                      onChange={(e) => updatePreset(index, { ...preset, name: e.target.value })}
                      placeholder={t('prompts.preset_name', 'Preset Name')}
                      aria-label={t('prompts.preset_name', 'Preset Name')}
                      disabled={!config.enabled}
                    />
                    <div className={styles['preset-actions']}>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removePreset(index)}
                        disabled={!config.enabled}
                      >
                        {t('common.delete')}
                      </Button>
                    </div>
                  </div>

                  <div className={styles['preset-config']}>
                    <div className="form-group">
                      <label className={styles['form-label']} htmlFor={`preset-models-${index}`}>
                        {t('prompts.models', 'Model Patterns')}
                      </label>
                      <input
                        className={styles.input}
                        type="text"
                        id={`preset-models-${index}`}
                        value={preset.models.join(', ')}
                        onChange={(e) => updatePreset(index, { ...preset, models: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                        placeholder="gpt-*, claude-*, *"
                        disabled={!config.enabled}
                      />
                      <p className={styles['form-hint']}>{t('prompts.models_hint', 'Comma-separated model patterns. Use * for wildcard.')}</p>
                    </div>

                    <div className="form-group">
                      <label className={styles['form-label']} htmlFor={`preset-match-${index}`}>
                        {t('prompts.match', 'Match Conditions')}
                      </label>
                      <textarea
                        className={styles.input}
                        id={`preset-match-${index}`}
                        value={JSON.stringify(preset.match || [], null, 2)}
                        onChange={(e) => {
                          try {
                            updatePreset(index, { ...preset, match: JSON.parse(e.target.value) });
                          } catch {
                            // Ignore JSON parse errors during typing
                          }
                        }}
                        placeholder='[{"field": "value"}]'
                        rows={3}
                        disabled={!config.enabled}
                      />
                      <p className={styles['form-hint']}>{t('prompts.match_hint', 'JSON array of match conditions.')}</p>
                    </div>

                    <div className="form-group">
                      <label className={styles['form-label']} htmlFor={`preset-not-match-${index}`}>
                        {t('prompts.not_match', 'Not Match Conditions')}
                      </label>
                      <textarea
                        className={styles.input}
                        id={`preset-not-match-${index}`}
                        value={JSON.stringify(preset['not-match'] || [], null, 2)}
                        onChange={(e) => {
                          try {
                            updatePreset(index, { ...preset, 'not-match': JSON.parse(e.target.value) });
                          } catch {
                            // Ignore JSON parse errors during typing
                          }
                        }}
                        placeholder='[{"field": "value"}]'
                        rows={3}
                        disabled={!config.enabled}
                      />
                      <p className={styles['form-hint']}>{t('prompts.not_match_hint', 'JSON array of not-match conditions.')}</p>
                    </div>

                    <div className="form-group">
                      <label className={styles['form-label']}>{t('prompts.inject', 'Injection')}</label>
                      <div className={styles['inject-fields']}>
                        <div className="form-group">
                          <label className={styles['form-label']} htmlFor={`preset-system-${index}`}>
                            {t('prompts.system', 'System Prompt')}
                          </label>
                          <textarea
                            className={styles.input}
                            id={`preset-system-${index}`}
                            value={preset.inject.system || ''}
                            onChange={(e) => updatePreset(index, { ...preset, inject: { ...preset.inject, system: e.target.value } })}
                            placeholder="You are a helpful assistant..."
                            rows={3}
                            disabled={!config.enabled}
                          />
                        </div>
                        <div className="form-group">
                          <label className={styles['form-label']} htmlFor={`preset-mode-${index}`}>
                            {t('prompts.system_mode', 'System Mode')}
                          </label>
                          <select
                            id={`preset-mode-${index}`}
                            className={styles.select}
                            value={preset.inject['system-mode'] || 'merge'}
                            onChange={(e) => updatePreset(index, { ...preset, inject: { ...preset.inject, 'system-mode': e.target.value } })}
                            disabled={!config.enabled}
                          >
                            <option value="replace">{t('prompts.mode_replace', 'Replace')}</option>
                            <option value="merge">{t('prompts.mode_merge', 'Merge')}</option>
                            <option value="prepend">{t('prompts.mode_prepend', 'Prepend')}</option>
                            <option value="append">{t('prompts.mode_append', 'Append')}</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className={styles['form-label']} htmlFor={`preset-prepend-${index}`}>
                            {t('prompts.prepend_user', 'Prepend User')}
                          </label>
                          <input
                            className={styles.input}
                            type="text"
                            id={`preset-prepend-${index}`}
                            value={preset.inject['prepend-user'] || ''}
                            onChange={(e) => updatePreset(index, { ...preset, inject: { ...preset.inject, 'prepend-user': e.target.value } })}
                            disabled={!config.enabled}
                          />
                        </div>
                        <div className="form-group">
                          <label className={styles['form-label']} htmlFor={`preset-append-${index}`}>
                            {t('prompts.append_user', 'Append User')}
                          </label>
                          <input
                            className={styles.input}
                            type="text"
                            id={`preset-append-${index}`}
                            value={preset.inject['append-user'] || ''}
                            onChange={(e) => updatePreset(index, { ...preset, inject: { ...preset.inject, 'append-user': e.target.value } })}
                            disabled={!config.enabled}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            <div className={styles['disabled-notice']}>
              {t('prompts.enable_first', 'Enable prompts to configure presets')}
            </div>
          )}
        </div>

        <div className={styles['section-divider']} />

        <div className={styles['default-inject-section']}>
          <h3>{t('prompts.default_inject', 'Default Injection')}</h3>
          <p className={styles['form-hint']}>{t('prompts.default_inject_hint', 'Applied when no preset matches but prompts are enabled')}</p>

          <div className={styles['inject-fields']}>
            <div className="form-group">
              <label className={styles['form-label']} htmlFor="default-system">
                {t('prompts.system', 'System Prompt')}
              </label>
              <textarea
                className={styles.input}
                id="default-system"
                value={config.default.system || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, default: { ...prev.default, system: e.target.value } }))}
                placeholder="Default system prompt..."
                rows={3}
                disabled={!config.enabled}
              />
            </div>
            <div className="form-group">
              <label className={styles['form-label']} htmlFor="default-system-mode">
                {t('prompts.system_mode', 'System Mode')}
              </label>
              <select
                id="default-system-mode"
                className={styles.select}
                value={config.default['system-mode'] || 'merge'}
                onChange={(e) => setConfig(prev => ({ ...prev, default: { ...prev.default, 'system-mode': e.target.value } }))}
                disabled={!config.enabled}
              >
                <option value="replace">{t('prompts.mode_replace', 'Replace')}</option>
                <option value="merge">{t('prompts.mode_merge', 'Merge')}</option>
                <option value="prepend">{t('prompts.mode_prepend', 'Prepend')}</option>
                <option value="append">{t('prompts.mode_append', 'Append')}</option>
              </select>
            </div>
            <div className="form-group">
              <label className={styles['form-label']} htmlFor="default-prepend-user">
                {t('prompts.prepend_user', 'Prepend User')}
              </label>
              <input
                className={styles.input}
                type="text"
                id="default-prepend-user"
                value={config.default['prepend-user'] || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, default: { ...prev.default, 'prepend-user': e.target.value } }))}
                disabled={!config.enabled}
              />
            </div>
            <div className="form-group">
              <label className={styles['form-label']} htmlFor="default-append-user">
                {t('prompts.append_user', 'Append User')}
              </label>
              <input
                className={styles.input}
                type="text"
                id="default-append-user"
                value={config.default['append-user'] || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, default: { ...prev.default, 'append-user': e.target.value } }))}
                disabled={!config.enabled}
              />
            </div>
          </div>
        </div>

        {saveError && (
          <div className={styles['error-box']} role="alert">
            <span className={styles['error-message']}>
              {t('prompts.save_error', 'Failed to save Prompts config')}: {saveError}
            </span>
          </div>
        )}

        <Button
          variant="primary"
          onClick={() => void handleSave()}
          loading={saving}
          disabled={!config.enabled}
        >
          {saving ? t('common.saving') : t('common.save')}
        </Button>
      </div>
    </div>
  );
}
