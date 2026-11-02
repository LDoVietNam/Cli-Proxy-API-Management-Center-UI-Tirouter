/**
 * Page Constants - Single Source of Truth
 * Consolidates hardcoded arrays, strings, and configuration from page components
 */

// ============================================
// Dashboard Constants
// ============================================

export const DASH = '—' as const;

/** 大数字：六位以内用千分位，再往上压缩，避免撑破排版 */
export const formatHeadline = (value: number): string =>
  value < 100_000 ? value.toLocaleString() : value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const TILE_ACCENTS = {
  good: 'var(--viz-success)',
  warning: 'var(--amber-color)',
  critical: 'var(--viz-failure)',
  idle: 'var(--text-quaternary)',
} as const;

export const PAGE_TABS = [
  { id: 'management', labelKey: 'nav.quota_management' },
  { id: 'monitoring', labelKey: 'nav.quota_monitoring' },
] as const;

export const MANAGEMENT_TAB_ID = 'quota-page-tab-management';
export const MONITORING_TAB_ID = 'quota-page-tab-monitoring';
export const MANAGEMENT_PANEL_ID = 'quota-page-panel-management';
export const MONITORING_PANEL_ID = 'quota-page-panel-monitoring';

export const QUOTA_TAB_ORDER = [
  'antigravity',
  'claude',
  'codex',
  'kimi',
  'xai',
] as const;

export const CARD_ENTRANCE_BUDGET_MS = 600;
export const QUOTA_PAGE_SIZE = 10;

export const CTA_CARDS = [
  {
    to: '/ai-providers',
    iconName: 'bot',
    titleKey: 'nav.ai_providers',
    descriptionKey: 'dashboard.cta_providers_desc',
  },
  {
    to: '/auth-files',
    iconName: 'file-text',
    titleKey: 'nav.auth_files',
    descriptionKey: 'dashboard.cta_auth_files_desc',
  },
  {
    to: '/config',
    iconName: 'sidebar-config',
    titleKey: 'nav.config_management',
    descriptionKey: 'dashboard.cta_config_desc',
  },
  {
    to: '/quota',
    iconName: 'sidebar-quota',
    titleKey: 'nav.quota_management',
    descriptionKey: 'dashboard.cta_quota_desc',
  },
  {
    to: '/logs',
    iconName: 'sidebar-logs',
    titleKey: 'nav.logs',
    descriptionKey: 'dashboard.cta_logs_desc',
  },
  {
    to: '/system',
    iconName: 'sidebar-system',
    titleKey: 'nav.system_info',
    descriptionKey: 'dashboard.cta_system_desc',
  },
] as const;

// Runtime rows for dashboard
export const RUNTIME_ROWS = [
  { key: 'routing', labelKey: 'dashboard.runtime_routing', path: 'routingStrategy' },
  { key: 'retry', labelKey: 'dashboard.runtime_retry', path: 'requestRetry' },
  { key: 'managementKeys', labelKey: 'dashboard.runtime_management_keys', path: 'managementKeys' },
  { key: 'version', labelKey: 'dashboard.runtime_version', path: 'version' },
  { key: 'build', labelKey: 'dashboard.runtime_build', path: 'buildDate', format: 'date' },
  { key: 'proxy', labelKey: 'dashboard.runtime_proxy', path: 'proxyUrl', mono: true },
] as const;

export const RUNTIME_TOGGLES = [
  { key: 'debug', labelKey: 'dashboard.runtime_debug', path: 'debug' },
  { key: 'loggingToFile', labelKey: 'dashboard.runtime_file_logging', path: 'loggingToFile' },
  { key: 'requestLog', labelKey: 'dashboard.runtime_request_log', path: 'requestLog' },
  { key: 'wsAuth', labelKey: 'dashboard.runtime_ws_auth', path: 'wsAuth' },
  { key: 'forceModelPrefix', labelKey: 'dashboard.runtime_model_prefix', path: 'forceModelPrefix' },
] as const;

// ============================================
// Quota Constants
// ============================================

export const QUOTA_PROVIDER_TYPES = [
  'antigravity',
  'claude',
  'codex',
  'kimi',
  'xai',
] as const;

export type QuotaProviderType = typeof QUOTA_PROVIDER_TYPES[number];

// ============================================
// Config Sections (for schema-driven config)
// ============================================

export const CONFIG_SECTIONS = [
  { id: 'common', labelKey: 'nav.config_management', component: 'SectionCommon' },
  { id: 'connectivity', labelKey: 'config.section.connectivity', component: 'SectionConnectivity' },
  { id: 'payload', labelKey: 'config.section.payload', component: 'SectionPayload' },
  { id: 'streaming', labelKey: 'config.section.streaming', component: 'SectionStreaming' },
  { id: 'quota', labelKey: 'config.section.quota', component: 'SectionQuota' },
  { id: 'logging', labelKey: 'config.section.logging', component: 'SectionLogging' },
  { id: 'advanced', labelKey: 'config.section.advanced', component: 'SectionAdvanced' },
  { id: 'routing', labelKey: 'config.section.routing', component: 'SectionRoutingExtended' },
  { id: 'quotaExtended', labelKey: 'config.section.quota_extended', component: 'SectionQuotaExtended' },
  { id: 'infrastructure', labelKey: 'config.section.infrastructure', component: 'SectionInfrastructure' },
  { id: 'caveman', labelKey: 'config.section.caveman', component: 'SectionCaveman' },
  { id: 'prompts', labelKey: 'config.section.prompts', component: 'SectionPrompts' },
  { id: 'rtk', labelKey: 'config.section.rtk', component: 'SectionRTK' },
  { id: 'protocolConfigs', labelKey: 'config.section.protocol_configs', component: 'SectionProtocolConfigs' },
  { id: 'llmFeatures', labelKey: 'config.section.llm_features', component: 'SectionLLMFeatures' },
] as const;

// ============================================
// Navigation Groups
// ============================================

export const NAV_GROUPS = {
  operate: {
    id: 'operate',
    labelKey: 'nav_groups.operate',
    items: [
      { path: '/', labelKey: 'nav.dashboard', metaKey: 'nav_meta.dashboard', icon: 'dashboard' },
    ],
  },
  gateway: {
    id: 'gateway',
    labelKey: 'nav_groups.gateway',
    items: [
      { path: '/ai-providers', labelKey: 'nav.ai_providers', metaKey: 'nav_meta.ai_providers', icon: 'aiProviders' },
      { path: '/auth-files', labelKey: 'nav.auth_files', metaKey: 'nav_meta.auth_files', icon: 'authFiles' },
      { path: '/oauth', labelKey: 'nav.oauth', metaKey: 'nav_meta.oauth', icon: 'oauth' },
      { path: '/models', labelKey: 'nav.models', metaKey: 'nav_meta.models', icon: 'models' },
    ],
  },
  observe: {
    id: 'observe',
    labelKey: 'nav_groups.observe',
    items: [
      { path: '/quota', labelKey: 'nav.quota_management', metaKey: 'nav_meta.quota_management', icon: 'quota' },
      { path: '/logs', labelKey: 'nav.logs', metaKey: 'nav_meta.logs', icon: 'logs' },
    ],
  },
  control: {
    id: 'control',
    labelKey: 'nav_groups.control',
    items: [
      { path: '/config', labelKey: 'nav.config_management', metaKey: 'nav_meta.config_management', icon: 'config' },
      { path: '/rtk', labelKey: 'nav.rtk_config', metaKey: 'nav_meta.rtk_config', icon: 'rtk' },
      { path: '/prompts', labelKey: 'nav.prompts_config', metaKey: 'nav_meta.prompts_config', icon: 'prompts' },
      { path: '/system', labelKey: 'nav.system_info', metaKey: 'nav_meta.system_info', icon: 'system' },
    ],
  },
} as const;

// ============================================
// Common UI Constants
// ============================================

export const LAZY_FALLBACK_CLASS = 'lazy-fallback';
export const LAZY_FALLBACK_ARIA_LABEL = 'Loading page...';

export const PAGE_TRANSITION_VARIANTS = ['vertical', 'ios'] as const;

export const THEME_CARDS = [
  {
    key: 'auto',
    labelKey: 'theme.auto',
    colors: {
      bg: 'linear-gradient(135deg, #ffffff 0 50%, #111111 50% 100%)',
      card: 'linear-gradient(135deg, #ffffff 0 50%, #1a1a1a 50% 100%)',
      border: '#bdbdbd',
      text: '#2d2a26',
      textMuted: 'linear-gradient(135deg, #c9c9c9 0 50%, #5a5a5a 50% 100%)',
    },
  },
  {
    key: 'white',
    labelKey: 'theme.white',
    colors: {
      bg: '#ffffff',
      card: '#ffffff',
      border: '#e5e5e5',
      text: '#2d2a26',
      textMuted: '#a29c95',
    },
  },
  {
    key: 'light',
    labelKey: 'theme.light',
    colors: {
      bg: '#faf9f5',
      card: '#f0eee8',
      border: '#e3e1db',
      text: '#2d2a26',
      textMuted: '#a29c95',
    },
  },
  {
    key: 'dark',
    labelKey: 'theme.dark',
    colors: {
      bg: '#151412',
      card: '#1d1b18',
      border: '#3a3530',
      text: '#f6f4f1',
      textMuted: '#9c958d',
    },
  },
] as const;

export const LANGUAGE_ORDER = ['en', 'ru', 'zh', 'vi'] as const;

export const LANGUAGE_LABEL_KEYS = {
  en: 'language.en',
  ru: 'language.ru',
  zh: 'language.zh',
  vi: 'language.vi',
} as const;