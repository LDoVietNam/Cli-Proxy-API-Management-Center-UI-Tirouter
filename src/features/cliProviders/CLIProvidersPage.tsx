import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useNotificationStore } from '@/stores';
import { tirouterApi } from '@/services/api';
import { oauthApi } from '@/services/api/oauth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getErrorMessage } from '@/utils/helpers';
import type { CLIProviderStatus } from '@/types';
import styles from './CLIProvidersPage.module.scss';

interface ProviderConfigUI {
  key: string;
  label: string;
  icon: React.ReactNode;
}

// Shared layers icon — used by all local-binary CLI providers (previously
// 9 copy-pasted identical SVG functions: Kilo/Codex/Aider/Cline/Kiro/MiMo/Qwen/Qoder/Devin).
function IconLayers() {
  return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="currentColor" strokeWidth="2"/></svg>;
}

function IconOpenCode() {
  return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M14 2v6h6" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M16 13H8" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M16 17H8" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M10 9H8" fill="none" stroke="currentColor" strokeWidth="2"/></svg>;
}
function IconClaudeCode() {
  return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.19.2 2.33.54 3.36l1.23 1.23c1.14.31 2.4.49 3.76.49s2.62-.18 3.76-.49l1.23-1.23c.34-1.03.54-2.17.54-3.36V15l3.54-3.54c-.13-.58-.21-1.17-.21-1.79 0-4.08-3.05-7.44-7-7.93z" fill="currentColor"/></svg>;
}
function IconFreebuff() {
  // Lightning bolt — "free" fast inference, HTTP-based (no local binary).
  return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M13 2L4.5 13.5H11L9.5 22 19 10h-6.5L13 2z" fill="currentColor"/></svg>;
}
function IconGeminiCLI() {
  // Gemini sparkle — OAuth device flow (no local binary)
  return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 2L5 20H19L12 2Zm0 4L16 18H12.5L10 9H10L7.5 18H4L12 6Z" fill="currentColor"/></svg>;
}
function IconWindsurf() {
  // Windsurf — API key provider (waves/sail icon)
  return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M2 19.5C2 17 4 12 9 10c5-2 11-2 13 0 0 4 2 5 0 6-2 1-6 2-8 1Z" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M12 2c3 2 5 5 5 9" fill="none" stroke="currentColor" strokeWidth="2"/></svg>;
}

const PROVIDER_CONFIGS: ProviderConfigUI[] = [
  { key: 'kilo', label: 'KiloCode', icon: <IconLayers /> },
  { key: 'opencode', label: 'OpenCode', icon: <IconOpenCode /> },
  { key: 'claude-code', label: 'Claude Code', icon: <IconClaudeCode /> },
  { key: 'codex-cli', label: 'Codex CLI', icon: <IconLayers /> },
  { key: 'aider', label: 'Aider', icon: <IconLayers /> },
  { key: 'cline', label: 'Cline', icon: <IconLayers /> },
  { key: 'kiro-cli', label: 'Kiro CLI', icon: <IconLayers /> },
  { key: 'mimo', label: 'MiMo Code', icon: <IconLayers /> },
  { key: 'qwen', label: 'Qwen Code', icon: <IconLayers /> },
  { key: 'qodercli', label: 'Qoder CLI', icon: <IconLayers /> },
  // NOTE: gemini-cli is intentionally absent — the management API
  // (ListProviders / status switch) does not enumerate it yet, so a card here
  // would always render as disabled regardless of config.
  { key: 'devin', label: 'Devin', icon: <IconLayers /> },
  { key: 'freebuff', label: 'Freebuff', icon: <IconFreebuff /> },
  // gemini-cli was intentionally omitted before; now supported via OAuth device flow
  { key: 'gemini-cli', label: 'Gemini CLI', icon: <IconGeminiCLI /> },
  // windsurf — API key provider (no local binary)
  { key: 'windsurf', label: 'Windsurf', icon: <IconWindsurf /> },
];

interface FreebuffLoginState {
  state: string;
  status: 'waiting' | 'error';
  error?: string;
}

export function CLIProvidersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { showNotification } = useNotificationStore();
  const [providers, setProviders] = useState<CLIProviderStatus[]>([]);
  const [details, setDetails] = useState<Record<string, CLIProviderStatus>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  // Freebuff credential configure state
  const [fbApiKey, setFbApiKey] = useState('');
  const [fbSaving, setFbSaving] = useState(false);
  const [fbLogin, setFbLogin] = useState<FreebuffLoginState | null>(null);
  const fbPollRef = useRef<number | null>(null);

  const loadProviders = async () => {
    try {
      const response = await tirouterApi.listCLIProviders();
      // API returns { name: string; enabled: boolean }[], convert to CLIProviderStatus[]
      const providersList = (response.providers || []).map(p => ({ provider: p.name, enabled: p.enabled }));
      setProviders(providersList);
      // Load detailed status for each enabled provider
      for (const p of providersList) {
        if (p.enabled) {
          try {
            const detail = await tirouterApi.getCLIProviderStatus(p.provider);
            setDetails(prev => ({ ...prev, [p.provider]: detail }));
          } catch {
            // Ignore individual errors
          }
        }
      }
    } catch (error) {
      console.error('Failed to load CLI providers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    loadProviders();
  }, [isAuthenticated, navigate]);

  // Stop any in-flight Freebuff OAuth polling when leaving the page.
  useEffect(() => {
    return () => {
      if (fbPollRef.current !== null) {
        window.clearInterval(fbPollRef.current);
        fbPollRef.current = null;
      }
    };
  }, []);

  const toggleExpand = (provider: string) => {
    setExpanded(prev => prev === provider ? null : provider);
  };

  const handleSaveFreebuffKey = async () => {
    const key = fbApiKey.trim();
    if (!key) {
      showNotification(t('cli_providers.key_required') || 'Please paste a Freebuff API key first', 'warning');
      return;
    }
    setFbSaving(true);
    try {
      await tirouterApi.setFreebuffCredential(key);
      setFbApiKey('');
      showNotification(t('cli_providers.key_saved') || 'Freebuff API key saved', 'success');
      await loadProviders();
    } catch (err) {
      showNotification(
        `${t('cli_providers.key_save_failed') || 'Failed to save Freebuff API key'}: ${getErrorMessage(err)}`,
        'error'
      );
    } finally {
      setFbSaving(false);
    }
  };

  const stopFbPolling = () => {
    if (fbPollRef.current !== null) {
      window.clearInterval(fbPollRef.current);
      fbPollRef.current = null;
    }
  };

  const startFbPolling = (state: string) => {
    stopFbPolling();
    fbPollRef.current = window.setInterval(async () => {
      try {
        const res = await oauthApi.getAuthStatus(state);
        if (res.status === 'ok') {
          stopFbPolling();
          setFbLogin(null);
          showNotification(t('cli_providers.login_success') || 'Freebuff login successful', 'success');
          await loadProviders();
        } else if (res.status === 'error') {
          stopFbPolling();
          setFbLogin({ state, status: 'error', error: res.error });
          showNotification(
            `${t('cli_providers.login_failed') || 'Freebuff login failed'}: ${res.error || ''}`,
            'error'
          );
        }
        // 'wait' → keep polling
      } catch (err) {
        stopFbPolling();
        setFbLogin({ state, status: 'error', error: getErrorMessage(err) });
        showNotification(
          `${t('cli_providers.polling_failed') || 'Failed to check Freebuff login status'}: ${getErrorMessage(err)}`,
          'error'
        );
      }
    }, 2000);
  };

  const handleFreebuffLogin = async () => {
    try {
      const res = await oauthApi.startAuth('freebuff');
      if (!res.state) {
        showNotification(t('auth_login.missing_state') || 'Unable to retrieve authentication state parameter', 'error');
        return;
      }
      if (res.url) {
        window.open(res.url, '_blank', 'noopener,noreferrer');
      }
      setFbLogin({ state: res.state, status: 'waiting' });
      startFbPolling(res.state);
    } catch (err) {
      showNotification(
        `${t('cli_providers.login_start_failed') || 'Failed to start Freebuff login'}: ${getErrorMessage(err)}`,
        'error'
      );
    }
  };

  const getStatusBadge = (status: CLIProviderStatus) => {
    if (!status.enabled) {
      return <span className={`${styles.badge} ${styles.badgeMuted}`}>{t('nav.disabled') || 'Disabled'}</span>;
    }
    if (status.provider === 'freebuff') {
      // Freebuff is HTTP-based: readiness is about credentials, not the binary.
      // When auth_resolved is absent (older backend), fall back to a neutral
      // "Enabled" badge instead of a misleading "No Credentials".
      if (status.auth_resolved === undefined) {
        return <span className={`${styles.badge} ${styles.badgeSuccess}`}>{t('nav.enabled') || 'Enabled'}</span>;
      }
      return status.auth_resolved ? (
        <span className={`${styles.badge} ${styles.badgeSuccess}`}>{t('cli_providers.auth_ok') || 'Credentials Ready'}</span>
      ) : (
        <span className={`${styles.badge} ${styles.badgeError}`}>{t('cli_providers.auth_missing') || 'No Credentials'}</span>
      );
    }
    // Non-binary providers (OAuth / API key): readiness is about auth config, not executable
    const isNonBinary = status.provider === 'gemini-cli' || status.provider === 'windsurf';
    if (isNonBinary) {
      if (status.auth_mode === 'oauth') {
        return <span className={`${styles.badge} ${styles.badgeSuccess}`}>{t('cli_providers.oauth_ready') || 'OAuth Ready'}</span>;
      }
      if (status.auth_mode === 'api-key') {
        return <span className={`${styles.badge} ${styles.badgeSuccess}`}>{t('cli_providers.apikey_configured') || 'API Key Configured'}</span>;
      }
      return <span className={`${styles.badge} ${styles.badgeWarning}`}>{t('cli_providers.auth_pending') || 'Auth Pending'}</span>;
    }
    if (!status.binary_exists) {
      return <span className={`${styles.badge} ${styles.badgeError}`}>{t('cli_providers.binary_missing') || 'Binary Missing'}</span>;
    }
    if (!status.executable) {
      return <span className={`${styles.badge} ${styles.badgeWarning}`}>{t('cli_providers.not_executable') || 'Not Executable'}</span>;
    }
    return <span className={`${styles.badge} ${styles.badgeSuccess}`}>{t('nav.enabled') || 'Enabled'}</span>;
  };

  const renderCredentialSection = () => (
    <div className={styles.credentialSection}>
      <h4 className={styles.credentialTitle}>{t('cli_providers.configure') || 'Configure Credentials'}</h4>
      <p className={styles.credentialHint}>
        {t('cli_providers.configure_hint') ||
          'Paste a Freebuff auth token, or log in with the Freebuff website — credentials are saved to config.yaml automatically.'}
      </p>

      <div className={styles.credentialForm}>
        <input
          type="password"
          className={styles.credentialInput}
          placeholder={t('cli_providers.api_key_placeholder') || 'Paste your Freebuff auth token…'}
          value={fbApiKey}
          onChange={e => setFbApiKey(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleSaveFreebuffKey();
            }
          }}
          autoComplete="off"
        />
        <button
          type="button"
          className={styles.credentialButton}
          onClick={handleSaveFreebuffKey}
          disabled={fbSaving || !fbApiKey.trim()}
        >
          {fbSaving
            ? (t('common.saving') || 'Saving…')
            : (t('cli_providers.save_key') || 'Save Key')}
        </button>
      </div>

      <div className={styles.credentialDivider}>{t('common.or') || 'or'}</div>

      <button
        type="button"
        className={styles.credentialButtonSecondary}
        onClick={handleFreebuffLogin}
        disabled={fbLogin?.status === 'waiting'}
      >
        {fbLogin?.status === 'waiting' ? (
          <span className={styles.oauthSpinner} aria-hidden="true" />
        ) : (
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path d="M13 2L4.5 13.5H11L9.5 22 19 10h-6.5L13 2z" fill="currentColor" />
          </svg>
        )}
        {t('cli_providers.login_button') || 'Login with Freebuff'}
      </button>

      {fbLogin?.status === 'waiting' && (
        <div className={`${styles.oauthStatus} ${styles.waiting}`}>
          <span className={styles.oauthSpinner} aria-hidden="true" />
          <span>{t('cli_providers.login_waiting') || 'Waiting for Freebuff login to finish… (open the link, then confirm in the browser)'}</span>
        </div>
      )}
      {fbLogin?.status === 'error' && (
        <div className={`${styles.oauthStatus} ${styles.error}`}>
          <span>{t('cli_providers.login_failed') || 'Freebuff login failed'}: {fbLogin.error || ''}</span>
        </div>
      )}
    </div>
  );

  const renderFreebuffDetails = (detail: CLIProviderStatus) => (
    <>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>{t('cli_providers.auth_resolved') || 'Credentials'}</span>
        <span className={`${styles.detailValue} ${detail.auth_resolved ? styles.success : styles.error}`}>
          {detail.auth_resolved ? t('common.yes') : t('common.no')}
        </span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>{t('cli_providers.accounts') || 'Accounts'}</span>
        <span className={`${styles.detailValue} ${styles.fontMono}`}>
          {detail.account_count != null
            ? detail.accounts && detail.accounts.length > 0
              ? detail.accounts.join(', ')
              : String(detail.account_count)
            : '—'}
        </span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>{t('cli_providers.default_model') || 'Default Model'}</span>
        <span className={`${styles.detailValue} ${styles.fontMono}`}>{detail.default_model || '—'}</span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>{t('cli_providers.routing') || 'Routing'}</span>
        <span className={`${styles.detailValue} ${styles.fontMono}`}>{detail.routing || 'round-robin'}</span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>{t('cli_providers.base_url') || 'Backend URL'}</span>
        <span className={`${styles.detailValue} ${styles.fontMono}`}>{detail.base_url || '—'}</span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>{t('cli_providers.auth_mode') || 'Auth Mode'}</span>
        <span className={styles.detailValue}>{detail.auth_mode || t('common.not_set')}</span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>{t('cli_providers.binary') || 'Binary'}</span>
        <span className={`${styles.detailValue} ${styles.fontMono}`}>{detail.binary || t('cli_providers.binary_not_used') || 'N/A — HTTP-based provider'}</span>
      </div>
      {renderCredentialSection()}
    </>
  );

  const renderBinaryDetails = (detail: CLIProviderStatus) => (
    <>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>{t('cli_providers.binary') || 'Binary'}</span>
        <span className={styles.detailValue}>{detail.binary || t('common.not_set')}</span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>{t('cli_providers.binary_exists') || 'Binary Exists'}</span>
        <span className={`${styles.detailValue} ${detail.binary_exists ? styles.success : styles.error}`}>
          {detail.binary_exists ? t('common.yes') : t('common.no')}
        </span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>{t('cli_providers.executable') || 'Executable'}</span>
        <span className={`${styles.detailValue} ${detail.executable ? styles.success : styles.error}`}>
          {detail.executable ? t('common.yes') : t('common.no')}
        </span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>{t('cli_providers.config_dir') || 'Config Directory'}</span>
        <span className={`${styles.detailValue} ${styles.fontMono}`}>{detail.config_dir || t('common.not_set')}</span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>{t('cli_providers.auth_mode') || 'Auth Mode'}</span>
        <span className={styles.detailValue}>{detail.auth_mode || t('common.not_set')}</span>
      </div>
    </>
  );

  if (loading) {
    return (
      <div className={styles.cliProvidersPage}>
        <div className={styles.pageHeader}>
          <h1>{t('nav.cli_providers', 'CLI Providers')}</h1>
        </div>
        <div className={styles.loading}>
          <LoadingSpinner />
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cliProvidersPage}>
      <div className={styles.pageHeader}>
        <h1>{t('nav.cli_providers') || 'CLI Providers'}</h1>
        <p className={styles.pageDescription}>
          {t('cli_providers.description') || 'Manage local CLI provider integrations for direct model execution'}
        </p>
      </div>

      <div className={styles.providersGrid}>
        {PROVIDER_CONFIGS.map(({ key, label, icon }) => {
          const providerStatus = providers.find(p => p.provider === key);
          const detail = details[key];
          const isEnabled = providerStatus?.enabled ?? false;
          const isExpanded = expanded === key;
          // Freebuff can be configured (credentials / enable) from the UI even
          // when it is not enabled yet — its card is always expandable.
          const expandable = isEnabled;
          // Synthesize minimal status for disabled providers so the card still renders
          const cardDetail = detail ?? (key === 'freebuff' ? { provider: 'freebuff', enabled: false } : undefined);

          return (
            <div key={key} className={styles.providerCard}>
              <button
                type="button"
                className={styles.providerHeader}
                onClick={() => expandable && toggleExpand(key)}
                aria-expanded={expandable ? isExpanded : undefined}
                aria-controls={expandable ? `provider-details-${key}` : undefined}
                aria-disabled={!expandable || undefined}
              >
                <div className={styles.providerIcon}>{icon}</div>
                <div className={styles.providerInfo}>
                  <span className={styles.providerName}>{label}</span>
                  <span className={styles.providerKey}>{key}</span>
                </div>
                <div className={styles.providerStatus}>
                  {getStatusBadge(providerStatus || { provider: key, enabled: false })}
                </div>
                {expandable && (
                  <span className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`} aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
                  </span>
                )}
              </button>

              {expandable && isExpanded && cardDetail && (
                <div className={styles.providerDetails} id={`provider-details-${key}`}>
                  {cardDetail.provider === 'freebuff'
                    ? renderFreebuffDetails(cardDetail)
                    : renderBinaryDetails(cardDetail)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.sectionDivider} />

      <div className={styles.configSection}>
        <h2>{t('cli_providers.config_section') || 'Configuration Reference'}</h2>
        <p>{t('cli_providers.config_hint') || 'CLI providers are configured in config.yaml under cli-providers section'}</p>
        <pre className={styles.configExample}>{`cli-providers:
  enabled: true
  kilo:
    enabled: true
    binary: "path/to/kilo"
    auth-mode: cli
    model: "kilo"
    alias: "kilo-code"
    args: "--chat"
  opencode:
    enabled: true
    binary: "path/to/opencode"
    auth-mode: cli
    # ... other providers
  freebuff:
    # Freebuff is HTTP-based: the binary is NOT spawned for inference.
    # Credentials come from CODEBUFF_API_KEY, ~/.config/manicode/credentials.json
    # (written by \`freebuff login\`), or the accounts list below.
    enabled: true
    model: ""            # empty = deepseek/deepseek-v4-flash
    alias: "freebuff"
    # routing: round-robin   # round-robin (default) | least-used
    # accounts:
    #   - name: account-1
    #     credentials-file: ~/.config/freebuff/account1.json
    #   - name: account-2
    #     api-key: "\${FREEBUFF_KEY_2}"`}</pre>
      </div>
    </div>
  );
}
