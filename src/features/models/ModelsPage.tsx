import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { modelsApi } from '@/services/api/models';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import type { ModelTestResult, AvailableModel } from './modelsTypes';
import styles from './ModelsPage.module.scss';

type ViewMode = 'by-provider' | 'by-handler';
type HandlerId = 'openai' | 'claude' | 'gemini';
type ContextTier = 'low' | 'medium' | 'high' | 'huge';

export function ModelsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore((s) => ({ isAuthenticated: s.isAuthenticated }));

  const getContextLengthTier = (len: number): ContextTier => {
    if (len >= 128000) return 'huge';
    if (len >= 32000) return 'high';
    if (len >= 8000) return 'medium';
    return 'low';
  };

  const [viewMode, setViewMode] = useState<ViewMode>('by-provider');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedHandler, setSelectedHandler] = useState<HandlerId>('openai');
  const [modelsByProvider, setModelsByProvider] = useState<Record<string, AvailableModel[]>>({});
  const [modelsByHandler, setModelsByHandler] = useState<AvailableModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, ModelTestResult>>({});
  const [testingModel, setTestingModel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const fetchModelsByProvider = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await modelsApi.fetchAvailableModelsByProvider(selectedProvider || undefined);
      setModelsByProvider(data.models_by_provider || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch models');
      setModelsByProvider({});
    } finally {
      setLoading(false);
    }
  };

  const fetchModelsByHandler = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await modelsApi.fetchAvailableModels(selectedHandler);
      setModelsByHandler(data.models || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch models');
      setModelsByHandler([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'by-provider') {
      fetchModelsByProvider();
    } else {
      fetchModelsByHandler();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, selectedProvider, selectedHandler]);

  const handleTestModel = async (model: AvailableModel, provider: string) => {
    const modelId = model.id || model.name || 'unknown';
    const modelKey = `${provider}:${modelId}`;
    setTestingModel(modelKey);
    setError(null);

    try {
      const result = await modelsApi.testModel({
        model: modelId,
        provider,
        message: 'Hello, this is a test. Please respond briefly.',
        max_tokens: 50,
        temperature: 0.7,
      });
      setTestResults(prev => ({ ...prev, [modelKey]: result }));
    } catch (err) {
      setTestResults(prev => ({
        ...prev,
        [modelKey]: {
          ok: false,
          model: modelId,
          provider,
          latency: '0ms',
          error: err instanceof Error ? err.message : 'Test failed',
        },
      }));
    } finally {
      setTestingModel(null);
    }
  };

  const toggleExpanded = (modelKey: string) => {
    setExpandedModels(prev => {
      const next = new Set(prev);
      if (next.has(modelKey)) {
        next.delete(modelKey);
      } else {
        next.add(modelKey);
      }
      return next;
    });
  };

  const matchesQuery = (model: AvailableModel, query: string) =>
    (model.id?.toLowerCase().includes(query)) ||
    (model.name?.toLowerCase().includes(query)) ||
    (model.display_name?.toLowerCase().includes(query)) ||
    (model.description?.toLowerCase().includes(query));

  const filteredModelsByProvider = useMemo(() => {
    if (!searchQuery) return modelsByProvider;
    const query = searchQuery.toLowerCase();
    const filtered: Record<string, AvailableModel[]> = {};
    for (const [provider, models] of Object.entries(modelsByProvider)) {
      const matched = models.filter(m => matchesQuery(m, query));
      if (matched.length > 0) {
        filtered[provider] = matched;
      }
    }
    return filtered;
  }, [modelsByProvider, searchQuery]);

  const filteredModelsByHandler = useMemo(() => {
    if (!searchQuery) return modelsByHandler;
    const query = searchQuery.toLowerCase();
    return modelsByHandler.filter(m => matchesQuery(m, query));
  }, [modelsByHandler, searchQuery]);

  const allProviders = useMemo(() => {
    const providers = new Set<string>();
    for (const [provider] of Object.entries(modelsByProvider)) {
      providers.add(provider);
    }
    return Array.from(providers).sort();
  }, [modelsByProvider]);

  const testButton = (model: AvailableModel, provider: string) => {
    const modelKey = `${provider}:${model.id || model.name}`;
    const isExpanded = expandedModels.has(modelKey);
    const testResult = testResults[modelKey];
    const isTesting = testingModel === modelKey;

    return (
      <div className={styles['model-actions']}>
        <button
          type="button"
          className={`${styles['btn-test']} ${isTesting ? styles.testing : ''} ${testResult?.ok ? styles.success : testResult?.ok === false ? styles.failed : ''}`}
          onClick={() => void handleTestModel(model, provider)}
          disabled={loading || isTesting}
          aria-label={t('models.test')}
        >
          {isTesting ? (
            <span className={styles.spinner} aria-hidden="true" />
          ) : testResult?.ok ? (
            <span className={`${styles['status-icon']} ${styles.success}`} aria-hidden="true" />
          ) : testResult?.ok === false ? (
            <span className={`${styles['status-icon']} ${styles.failed}`} aria-hidden="true" />
          ) : null}
          <span className={styles['btn-label']}>
            {isTesting ? t('models.test_running') : t('models.test')}
          </span>
        </button>
        <button
          type="button"
          className={styles['btn-expand']}
          onClick={() => toggleExpanded(modelKey)}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? t('models.collapse') : t('models.expand')}
        >
          <span className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`} aria-hidden="true" />
        </button>
      </div>
    );
  };

  const testResultBlock = (testResult: ModelTestResult) => (
    <div className={`${styles['test-result']} ${testResult.ok ? styles.success : styles.error}`}>
      <div className={styles['test-result-header']}>
        <span>{testResult.ok ? t('models.test_passed') : t('models.test_failed')}</span>
        <span className={styles['test-latency']}>{testResult.latency}</span>
      </div>
      {testResult.status_code && (
        <div className={styles['test-result-row']}>
          <span className={styles['test-label']}>{t('models.status_code')}</span>
          <span className={styles['test-value']}>{testResult.status_code}</span>
        </div>
      )}
      {testResult.tokens_used && (
        <div className={styles['test-result-row']}>
          <span className={styles['test-label']}>{t('models.tokens_used')}</span>
          <span className={styles['test-value']}>
            {testResult.tokens_used} (prompt: {testResult.prompt_tokens}, completion: {testResult.completion_tokens})
          </span>
        </div>
      )}
      {testResult.error && (
        <div className={styles['test-error']}>
          {testResult.error}
        </div>
      )}
      {testResult.response && (
        <details className={styles['test-response']}>
          <summary>{t('models.response')}</summary>
          <pre>{testResult.response}</pre>
        </details>
      )}
    </div>
  );

  const modelDetails = (model: AvailableModel, testResult?: ModelTestResult) => (
    <div className={styles['model-details']}>
      <div className={styles['detail-row']}>
        <span className={styles['detail-label']}>{t('models.id')}</span>
        <span className={styles['detail-value']}>{model.id || model.name || '-'}</span>
      </div>
      {model.display_name && (
        <div className={styles['detail-row']}>
          <span className={styles['detail-label']}>{t('models.display_name')}</span>
          <span className={styles['detail-value']}>{model.display_name}</span>
        </div>
      )}
      {model.description && (
        <div className={styles['detail-row']}>
          <span className={styles['detail-label']}>{t('models.description_field')}</span>
          <span className={styles['detail-value']}>{model.description}</span>
        </div>
      )}
      {model.context_length && (
        <div className={styles['detail-row']}>
          <span className={styles['detail-label']}>{t('models.context_length')}</span>
          <span className={styles['detail-value']}>
            <span className={`${styles['context-length-badge']} ${styles[`tier-${getContextLengthTier(model.context_length)}`]}`}>
              {model.context_length.toLocaleString()} tokens
            </span>
          </span>
        </div>
      )}
      {model.max_completion_tokens && (
        <div className={styles['detail-row']}>
          <span className={styles['detail-label']}>{t('models.max_output')}</span>
          <span className={styles['detail-value']}>{model.max_completion_tokens.toLocaleString()} tokens</span>
        </div>
      )}
      {model.owned_by && (
        <div className={styles['detail-row']}>
          <span className={styles['detail-label']}>{t('models.owned_by')}</span>
          <span className={styles['detail-value']}>{model.owned_by}</span>
        </div>
      )}
      {model.type && (
        <div className={styles['detail-row']}>
          <span className={styles['detail-label']}>{t('models.type')}</span>
          <span className={styles['detail-value']}>{model.type}</span>
        </div>
      )}
      {model.supported_parameters && model.supported_parameters.length > 0 && (
        <div className={styles['detail-row']}>
          <span className={styles['detail-label']}>{t('models.supported_params')}</span>
          <span className={styles['detail-value']}>
            <span className={styles['param-container']}>
              {model.supported_parameters.map((p: string) => (
                <span key={p} className={styles['param-tag']}>{p}</span>
              ))}
            </span>
          </span>
        </div>
      )}
      {testResult && testResultBlock(testResult)}
    </div>
  );

  const skeletonGrid = (
    <div className={styles['skeleton-grid']} aria-hidden="true">
      <Skeleton className={styles['skeleton-card']} />
      <Skeleton className={styles['skeleton-card']} />
      <Skeleton className={styles['skeleton-card']} />
    </div>
  );

  const handlerLabel: Record<HandlerId, string> = {
    openai: t('models.handler_openai'),
    claude: t('models.handler_claude'),
    gemini: t('models.handler_gemini'),
  };

  return (
    <div className={styles['models-page']}>
      <div className={styles['page-header']}>
        <h1>{t('nav.models')}</h1>
        <p className={styles['page-description']}>
          {t('models.description')}
        </p>
      </div>

      {/* View Mode Tabs */}
      <div className={styles['view-tabs']} role="tablist" aria-label={t('nav.models')}>
        <button
          type="button"
          role="tab"
          id="models-tab-by-provider"
          aria-selected={viewMode === 'by-provider'}
          aria-controls="models-panel"
          className={`${styles.tab} ${viewMode === 'by-provider' ? styles.active : ''}`}
          onClick={() => setViewMode('by-provider')}
        >
          {t('models.by_provider')}
        </button>
        <button
          type="button"
          role="tab"
          id="models-tab-by-handler"
          aria-selected={viewMode === 'by-handler'}
          aria-controls="models-panel"
          className={`${styles.tab} ${viewMode === 'by-handler' ? styles.active : ''}`}
          onClick={() => setViewMode('by-handler')}
        >
          {t('models.by_handler')}
        </button>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles['search-box']}>
          <input
            type="text"
            placeholder={t('models.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles['search-input']}
            aria-label={t('models.search_placeholder')}
          />
        </div>

        {viewMode === 'by-provider' && (
          <div className={styles['provider-filter']}>
            <label htmlFor="models-provider-select">{t('models.filter_provider')}</label>
            <select
              id="models-provider-select"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className={styles['provider-select']}
            >
              <option value="">{t('models.all_providers')}</option>
              {allProviders.map(provider => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </select>
          </div>
        )}

        {viewMode === 'by-handler' && (
          <div className={styles['handler-filter']}>
            <label htmlFor="models-handler-select">{t('models.filter_handler')}</label>
            <select
              id="models-handler-select"
              value={selectedHandler}
              onChange={(e) => setSelectedHandler(e.target.value as HandlerId)}
              className={styles['provider-select']}
            >
              <option value="openai">OpenAI</option>
              <option value="claude">Claude</option>
              <option value="gemini">Gemini</option>
            </select>
          </div>
        )}

        <div className={styles['refresh-actions']}>
          <Button
            variant="primary"
            onClick={() => void (viewMode === 'by-provider' ? fetchModelsByProvider() : fetchModelsByHandler())}
            disabled={loading}
          >
            {t('common.refresh')}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className={styles['error-banner']} role="alert">
          {error}
        </div>
      )}

      {/* Models Content */}
      <div
        role="tabpanel"
        id="models-panel"
        aria-labelledby={viewMode === 'by-provider' ? 'models-tab-by-provider' : 'models-tab-by-handler'}
      >
        {viewMode === 'by-provider' ? (
          <div className={styles['models-by-provider']}>
            {loading ? (
              skeletonGrid
            ) : Object.keys(filteredModelsByProvider).length === 0 ? (
              <div className={styles['empty-state']}>
                {searchQuery ? (
                  <EmptyState
                    title={t('models.no_results')}
                    description={t('models.no_results_desc', 'Try a different search term or clear the search box.')}
                  />
                ) : (
                  <EmptyState
                    title={t('models.no_models')}
                    description={t('models.no_models_desc', 'Check your provider configurations and refresh.')}
                  />
                )}
              </div>
            ) : (
              Object.entries(filteredModelsByProvider).map(([provider, models]) => (
                <div key={provider} className={styles['provider-section']}>
                  <div className={styles['provider-header']}>
                    <h2 className={styles['provider-name']}>
                      <span className={styles['provider-icon']} aria-hidden="true">{provider.charAt(0).toUpperCase()}</span>
                      {provider}
                    </h2>
                    <span className={styles['model-count']}>{models.length} {t('models.models_count')}</span>
                  </div>
                  <div className={styles['models-grid']}>
                    {models.map(model => {
                      const modelKey = `${provider}:${model.id || model.name}`;
                      const isExpanded = expandedModels.has(modelKey);

                      return (
                        <div
                          key={modelKey}
                          className={`${styles['model-card']} ${styles[provider]}`}
                        >
                          <div className={styles['model-header']}>
                            <div className={styles['model-info']}>
                              <span className={styles['model-name']}>{model.display_name || model.id || model.name || 'Unknown'}</span>
                              {model.id && model.id !== model.name && (
                                <span className={styles['model-id']}>{model.id}</span>
                              )}
                            </div>
                            {testButton(model, provider)}
                          </div>
                          {isExpanded && modelDetails(model, testResults[modelKey])}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className={styles['models-by-handler']}>
            {loading ? (
              skeletonGrid
            ) : filteredModelsByHandler.length === 0 ? (
              <div className={styles['empty-state']}>
                {searchQuery ? (
                  <EmptyState
                    title={t('models.no_results')}
                    description={t('models.no_results_desc', 'Try a different search term or clear the search box.')}
                  />
                ) : (
                  <EmptyState
                    title={t('models.no_models_handler')}
                    description={t('models.no_models_desc', 'Check your provider configurations and refresh.')}
                  />
                )}
              </div>
            ) : (
              <div className={styles['models-grid']}>
                {filteredModelsByHandler.map(model => {
                  const modelKey = `${selectedHandler}:${model.id || model.name}`;
                  const isExpanded = expandedModels.has(modelKey);

                  return (
                    <div
                      key={modelKey}
                      className={`${styles['model-card']} ${styles[`handler-${selectedHandler}`]}`}
                    >
                      <div className={styles['model-header']}>
                        <div className={styles['model-info']}>
                          <span className={styles['model-name']}>{model.display_name || model.id || model.name || 'Unknown'}</span>
                          {model.id && model.id !== model.name && (
                            <span className={styles['model-id']}>{model.id}</span>
                          )}
                          <span className={styles['model-handler-badge']}>
                            {handlerLabel[selectedHandler]}
                          </span>
                        </div>
                        {testButton(model, selectedHandler)}
                      </div>
                      {isExpanded && modelDetails(model, testResults[modelKey])}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
