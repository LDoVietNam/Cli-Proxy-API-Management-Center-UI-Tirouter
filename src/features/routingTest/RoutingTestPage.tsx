import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { tirouterApi } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { RoutingTestRequest, RoutingTestResponse } from '@/types';
import styles from './RoutingTestPage.module.scss';

interface HistoryEntry extends RoutingTestRequest {
  response: RoutingTestResponse;
  timestamp: number;
}

export function RoutingTestPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [request, setRequest] = useState<RoutingTestRequest>({ endpoint: '', headers: {} });
  const [response, setResponse] = useState<RoutingTestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await tirouterApi.testRouting(request);
      setResponse(res);
      setHistory(prev => [{
        ...request,
        response: res,
        timestamp: Date.now(),
      }, ...prev].slice(0, 10));
    } catch (error) {
      setResponse({
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        latency: '0ms',
        endpoint: request.endpoint,
      });
    } finally {
      setLoading(false);
    }
  };

  const addHeader = () => {
    setRequest(prev => ({ ...prev, headers: { ...prev.headers, '': '' } }));
  };

  const updateHeader = (key: string, value: string) => {
    setRequest(prev => {
      const newHeaders = { ...prev.headers };
      if (key) newHeaders[key] = value;
      delete newHeaders[''];
      return { ...prev, headers: newHeaders };
    });
  };

  const removeHeader = (key: string) => {
    setRequest(prev => {
      const newHeaders = { ...prev.headers };
      delete newHeaders[key];
      return { ...prev, headers: newHeaders };
    });
  };

  const loadFromHistory = (item: HistoryEntry) => {
    setRequest({ endpoint: item.endpoint, headers: { ...item.headers } });
    setResponse(item.response);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className={styles['routing-test-page']}>
      <div className={styles['page-header']}>
        <h1>{t('nav.routing_test', 'Routing Test')}</h1>
        <p className={styles['page-description']}>
          {t('routing_test.description', 'Test connectivity to provider endpoints with custom headers')}
        </p>
      </div>

      <div className={styles['main-grid']}>
        <div className={styles['test-form-section']}>
          <div className={styles.card}>
            <h2>{t('routing_test.test_endpoint', 'Test Endpoint')}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className={styles['form-label']} htmlFor="routing-endpoint">
                  {t('routing_test.endpoint', 'Endpoint URL')}
                </label>
                <input
                  className={styles.input}
                  id="routing-endpoint"
                  type="url"
                  value={request.endpoint}
                  onChange={(e) => setRequest(prev => ({ ...prev, endpoint: e.target.value }))}
                  placeholder="https://api.example.com/v1/models"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <div className={styles['form-label']}>
                  <span>{t('routing_test.headers', 'Custom Headers')}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={addHeader} disabled={loading}>
                    {t('common.add')}
                  </Button>
                </div>
                <div className={styles['headers-grid']}>
                  {Object.entries(request.headers || {}).map(([key, value]) => (
                    <div key={key} className={styles['header-row']}>
                      <input
                        className={`${styles.input} ${styles['header-key']}`}
                        type="text"
                        value={key}
                        onChange={(e) => updateHeader(e.target.value, value)}
                        placeholder={t('routing_test.header_key', 'Header name')}
                        aria-label={t('routing_test.header_key', 'Header name')}
                        disabled={loading}
                      />
                      <input
                        className={`${styles.input} ${styles['header-value']}`}
                        type="text"
                        value={value}
                        onChange={(e) => updateHeader(key, e.target.value)}
                        placeholder={t('routing_test.header_value', 'Header value')}
                        aria-label={t('routing_test.header_value', 'Header value')}
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => removeHeader(key)}
                        disabled={loading}
                        aria-label={t('common.delete')}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                  {Object.keys(request.headers || {}).length === 0 && (
                    <p className={styles['form-hint']}>
                      {t(
                        'routing_test.no_headers',
                        'No custom headers. Click "Add" to include headers like Authorization, X-API-Key, etc.'
                      )}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                disabled={!request.endpoint}
              >
                {loading ? t('routing_test.testing', 'Testing...') : t('routing_test.test', 'Test')}
              </Button>
            </form>
          </div>
        </div>

        <div className={styles['result-section']}>
          <div className={styles.card}>
            <h2>{t('routing_test.result', 'Result')}</h2>
            {loading ? (
              <div className={styles['result-empty']}>
                <LoadingSpinner />
              </div>
            ) : response ? (
              <div
                className={`${styles.result} ${response.ok ? styles.success : styles.error}`}
                role="status"
              >
                <div className={styles['result-status']}>
                  <span className={`${styles['status-badge']} ${response.ok ? styles.ok : styles.error}`}>
                    {response.ok ? t('routing_test.success') : t('routing_test.failed')}
                  </span>
                </div>
                <div className={styles['result-details']}>
                  <div className={styles['detail-row']}>
                    <span className={styles['detail-label']}>{t('routing_test.status', 'Status')}</span>
                    <span className={styles['detail-value']}>{response.status || '-'}</span>
                  </div>
                  <div className={styles['detail-row']}>
                    <span className={styles['detail-label']}>{t('routing_test.latency', 'Latency')}</span>
                    <span className={styles['detail-value']}>{response.latency}</span>
                  </div>
                  <div className={styles['detail-row']}>
                    <span className={styles['detail-label']}>{t('routing_test.endpoint', 'Endpoint')}</span>
                    <span className={styles['detail-value']}>{response.endpoint}</span>
                  </div>
                  {response.error && (
                    <div className={styles['detail-row']}>
                      <span className={styles['detail-label']}>{t('routing_test.error', 'Error')}</span>
                      <span className={`${styles['detail-value']} ${styles['error-text']}`}>{response.error}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={styles['result-empty']}>
                <EmptyState
                  title={t('routing_test.no_result_title', 'No result yet')}
                  description={t(
                    'routing_test.no_result',
                    'Enter an endpoint and click Test to see results'
                  )}
                />
              </div>
            )}
          </div>

          <div className={`${styles.card} ${styles['history-section']}`}>
            <div className={styles['history-header']}>
              <h2>{t('routing_test.history', 'Recent Tests')}</h2>
              {history.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearHistory}>
                  {t('common.clear', 'Clear')}
                </Button>
              )}
            </div>
            {history.length === 0 ? (
              <EmptyState
                title={t('routing_test.history_empty_title', 'No recent tests')}
                description={t(
                  'routing_test.history_empty_desc',
                  'Run a test to see it here. Recent tests can be reloaded with one click.'
                )}
              />
            ) : (
              <div className={styles['history-list']}>
                {history.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`${styles['history-item']} ${response?.endpoint === item.endpoint ? styles.active : ''}`}
                    onClick={() => loadFromHistory(item)}
                    aria-label={t('routing_test.reload_from_history', 'Reload this test from history')}
                  >
                    <div className={styles['history-main']}>
                      <span
                        className={`${styles['history-status']} ${item.response.ok ? styles.ok : styles.error}`}
                        aria-hidden="true"
                      >
                        {item.response.ok ? '✓' : '✗'}
                      </span>
                      <span className={styles['history-endpoint']}>{item.endpoint}</span>
                    </div>
                    <div className={styles['history-meta']}>
                      <span className={styles['history-latency']}>{item.response.latency}</span>
                      <span className={styles['history-time']}>{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
