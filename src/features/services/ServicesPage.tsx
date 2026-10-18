import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { IconPlay, IconPause, IconRefreshCw, IconCheckCircle, IconAlertCircle } from '@/components/ui/icons';
import { servicesApi, type ServiceStatus } from '@/services/api/services';
import { llmApi, type LLMStatus, type LLMFeatureStatus } from '@/services/api/llm';
import { useNotificationStore } from '@/stores';
import styles from './ServicesPage.module.scss';

interface ServiceConfig {
  name: string;
  displayName: string;
  port: number;
  running: boolean;
  description: string;
  startCommand: string;
  health?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (isRecord(error)) {
    const data = error.response as { data?: { message?: string; error?: string } } | undefined;
    const message = data?.data?.message || data?.data?.error;
    if (typeof message === 'string' && message) return message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export function ServicesPage() {
  const { t } = useTranslation();
  const showNotification = useNotificationStore((state) => state.showNotification);

  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [llmStatus, setLlmStatus] = useState<LLMStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showRestartModal, setShowRestartModal] = useState<ServiceConfig | null>(null);
  const [cliOutput, setCliOutput] = useState<string | null>(null);
  const [showCliModal, setShowCliModal] = useState(false);

  // Default service configurations
  const defaultServices: ServiceConfig[] = [
    {
      name: 'tirouter',
      displayName: 'TiRouter Gateway',
      port: 3004,
      running: false,
      description: 'API Gateway proxy - OpenAI/Gemini/Claude compatible',
      startCommand: '.\\run.ps1 -Port 3004',
    },
    {
      name: 'openclaw',
      displayName: 'OpenClaw Gateway',
      port: 1807,
      running: false,
      description: 'Desktop Agent gateway with vision support',
      startCommand:
        'Z:\\02_CORE\\_cli\\nodejs\\node-v24.19.0-win-x64\\node.exe Z:\\02_CORE\\_cli\\providers\\bin\\openclaw\\openclaw.mjs gateway --port 1807',
    },
    {
      name: 'tibrain',
      displayName: 'TiBrain',
      port: 3005,
      running: false,
      description: 'Knowledge & Memory service',
      startCommand: 'tibrain.exe',
    },
  ];

  // Merge API status with service config
  const mergedServices: ServiceConfig[] = defaultServices.map((svc) => {
    const apiStatus = services.find((s) => s.name.toLowerCase() === svc.name.toLowerCase());
    return {
      ...svc,
      running: apiStatus?.running ?? svc.running,
      health: apiStatus?.health ?? 'unknown',
    };
  });

  // Fetch real-time status
  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await servicesApi.getServicesStatus();
      setServices(res.services);
    } catch (error: unknown) {
      showNotification(getApiErrorMessage(error, 'Failed to fetch service status'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (service: ServiceConfig) => {
    if (service.name === 'tirouter') {
      showNotification('Please start TiRouter via terminal or dashboard', 'info');
      return;
    }

    setActionLoading(`start-${service.name}`);
    try {
      await servicesApi.startService(service.name);
      showNotification(`${service.displayName} started successfully`, 'success');
      await fetchStatus();
    } catch (error: unknown) {
      showNotification(
        getApiErrorMessage(error, `Failed to start ${service.displayName}`),
        'error'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleStop = async (service: ServiceConfig) => {
    if (service.name === 'tirouter') {
      showNotification('TiRouter cannot be stopped via this interface', 'info');
      return;
    }

    setActionLoading(`stop-${service.name}`);
    try {
      await servicesApi.stopService(service.name);
      showNotification(`${service.displayName} stopped successfully`, 'success');
      await fetchStatus();
    } catch (error: unknown) {
      showNotification(
        getApiErrorMessage(error, `Failed to stop ${service.displayName}`),
        'error'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestart = (service: ServiceConfig) => {
    setShowRestartModal(service);
  };

  const confirmRestart = async () => {
    if (showRestartModal) {
      await handleStop(showRestartModal);
      await new Promise((r) => setTimeout(r, 2000));
      await handleStart(showRestartModal);
      setShowRestartModal(null);
    }
  };

  const handleCliCommand = async (service: ServiceConfig, args: string[]) => {
    if (service.name !== 'openclaw') return;

    setActionLoading(`cli-${service.name}`);
    try {
      const result = await servicesApi.runOpenClawCommand(args);
      setCliOutput(result.output);
      setShowCliModal(true);
      showNotification('CLI command executed', 'success');
    } catch (error: unknown) {
      showNotification(
        getApiErrorMessage(error, 'Failed to run CLI command'),
        'error'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const getHealthClassName = (health: string) => {
    switch (health) {
      case 'healthy':
        return styles.healthHealthy;
      case 'unhealthy':
        return styles.healthUnhealthy;
      default:
        return styles.healthUnknown;
    }
  };

  // Fetch LLM feature status
  const fetchLlmStatus = async () => {
    try {
      const res = await llmApi.getStatus();
      setLlmStatus(res);
    } catch (error: unknown) {
      console.error('Failed to fetch LLM status:', error);
    }
  };

  // Fetch status on mount & interval
  useEffect(() => {
    fetchStatus();
    fetchLlmStatus();
    const interval = setInterval(fetchStatus, 10000); // 10s polling
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const llmFeatures: [keyof LLMFeatureStatus, string][] = [
    ['health_query', 'Health Query'],
    ['routing', 'Smart Routing'],
    ['diagnostics', 'Diagnostics'],
    ['fix_suggester', 'Fix Suggester'],
  ];

  const llmProviders = llmStatus?.providers ?? {};

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          {t('services.title', 'Service Management')}
        </h1>
        <p className={styles.pageDescription}>
          {t('services.description', 'Manage TiRouter, OpenClaw, and TiBrain services')}
        </p>
      </header>

      {/* Main Services Grid */}
      <div className={styles.grid}>
        {mergedServices.map((service) => (
          <Card key={service.name} className={styles.serviceCard}>
            <div className={styles.serviceHeader}>
              <div className={styles.serviceIdentity}>
                <span className={styles.serviceName}>{service.displayName}</span>
                <span className={styles.serviceDescription}>{service.description}</span>
              </div>
              <span className={styles.servicePort}>Port {service.port}</span>
            </div>

            <div className={styles.serviceStatus}>
              <span className={styles.statusIndicator}>
                {service.running ? (
                  <IconCheckCircle size={16} className={styles.statusRunning} />
                ) : (
                  <IconAlertCircle size={16} className={styles.statusStopped} />
                )}
              </span>
              <span>
                {service.running ? t('services.running') : t('services.stopped')}
                {service.health && service.health !== 'unknown' && (
                  <span className={getHealthClassName(service.health)}>
                    {' (' + (service.health || '') + ')'}
                  </span>
                )}
              </span>
            </div>

            <div className={styles.serviceActions}>
              {service.running ? (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => void handleStop(service)}
                    loading={actionLoading === `stop-${service.name}`}
                  >
                    <IconPause size={16} /> {t('services.stop')}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleRestart(service)}>
                    <IconRefreshCw size={16} /> {t('services.restart')}
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => void handleStart(service)}
                  loading={actionLoading === `start-${service.name}`}
                >
                  <IconPlay size={16} /> {t('services.start')}
                </Button>
              )}

              {/* Quick CLI Actions for OpenClaw */}
              {service.name === 'openclaw' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void handleCliCommand(service, ['--version'])}
                  loading={actionLoading === `cli-${service.name}`}
                >
                  {'CLI'}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* LLM Features Status */}
      {llmStatus && (
        <Card className={styles.serviceCard}>
          <div className={styles.infoSection}>
            <h2 className={styles.sectionTitle}>
              {t('services.llmFeatures', 'LLM Features')}
            </h2>
            <div className={styles.featureBadges}>
              {llmFeatures.map(([key, label]) => {
                const enabled = llmStatus.features?.[key];
                return (
                  <span
                    key={key}
                    className={`${styles.featureBadge} ${enabled ? styles.featureEnabled : ''}`}
                  >
                    {enabled ? <IconCheckCircle size={14} /> : <IconAlertCircle size={14} />}
                    {label}
                  </span>
                );
              })}
            </div>
            {Object.keys(llmProviders).length > 0 ? (
              <div className={styles.providerSummary}>
                {t('services.llmProviders', 'Providers with credentials')}:{' '}
                {Object.entries(llmProviders)
                  .map(([provider, info]) => {
                    const count = info.model_count ?? info.models.length;
                    const modelNames = info.models
                      .map((m) => m.display_name || m.id)
                      .join(', ');
                    return `${provider} (${count} models${modelNames ? ': ' + modelNames : ''})`;
                  })
                  .join(', ')}
              </div>
            ) : (
              <div className={styles.providerSummary}>
                {t('services.llmNoProviders', 'No providers with credentials detected')}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Manual Actions Section */}
      <Card className={styles.serviceCard}>
        <div className={styles.infoSection}>
          <h2 className={styles.sectionTitle}>
            {t('services.quickActions', 'Quick Actions')}
          </h2>
          <div className={styles.quickActions}>
            <Button
              variant="primary"
              onClick={() => void handleStart({
                name: 'tibrain',
                displayName: 'TiBrain',
                port: 3005,
                running: false,
                description: '',
                startCommand: ''
              })}
              loading={actionLoading === 'start-tibrain'}
            >
              {t('services.start_tibrain', 'Start TiBrain')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => void handleStop({
                name: 'openclaw',
                displayName: 'OpenClaw',
                port: 1807,
                running: true,
                description: '',
                startCommand: ''
              })}
              loading={actionLoading === 'stop-openclaw'}
            >
              {t('services.stop_openclaw', 'Stop OpenClaw')}
            </Button>
            <Button variant="ghost" onClick={() => void fetchStatus()} loading={loading}>
              <IconRefreshCw size={16} /> {t('services.refresh')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Restart Confirmation Modal */}
      <Modal
        open={!!showRestartModal}
        onClose={() => setShowRestartModal(null)}
        title={
          showRestartModal
            ? t('services.restart_confirm', { service: showRestartModal.displayName })
            : ''
        }
      >
        <div className={styles.restartModal}>
          <p>{t('services.restart_warning')}</p>
          <div className={styles.modalActions}>
            <Button variant="ghost" onClick={() => setShowRestartModal(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={() => void confirmRestart()}>
              {t('common.confirm')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* CLI Output Modal */}
      <Modal
        open={showCliModal}
        onClose={() => setShowCliModal(false)}
        title="OpenClaw CLI Output"
      >
        <pre className={styles.cliOutput}>
          {cliOutput || 'No output'}
        </pre>
      </Modal>
    </div>
  );
}
