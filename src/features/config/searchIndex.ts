// Search index for the visual config editor's global "jump to field" search.
//
// IMPORTANT: this index is maintained by hand and is NOT what drives field
// rendering — it only powers search. When you add, remove, or move a field in
// components/sections/*.tsx (or fields/sharedFields.tsx), update the matching
// entry here, wrap the field's JSX in <FieldAnchor fieldId="..."> with the same
// `fieldId`, and map it in constants.ts FIELD_VALUE_KEYS.
// tests/configFieldParity.test.ts enforces the three-way parity — a missing or
// extra entry anywhere fails CI.

export type VisualSectionId =
  | 'connectivity'
  | 'network'
  | 'logging'
  | 'quota'
  | 'streaming'
  | 'advanced'
  | 'payload'
  | 'llmFeatures'
  | 'routingExtended'
  | 'quotaExtended'
  | 'protocolConfigs'
  | 'infrastructure'
  | 'advancedConfigs'
  | 'prompts'
  | 'promptNorm'
  | 'rtk'
  | 'caveman';

export interface ConfigFieldSearchEntry {
  /** Stable anchor id; matches FieldAnchor's `fieldId` and the rendered DOM id. */
  fieldId: string;
  sectionId: VisualSectionId;
  /** i18n key resolved with t() at search time so matching follows the active language. */
  labelKey: string;
  /** Optional secondary i18n key shown next to the label to disambiguate duplicates
   *  (e.g. Claude vs Codex "User-Agent"). Also searchable. */
  qualifierKey?: string;
  /** Optional hint i18n key — searchable but not shown in results. */
  hintKey?: string;
  /** Backend YAML key aliases, e.g. ['proxy-url']. Static strings (language-agnostic). */
  yamlKeys?: string[];
  /** Extra synonyms to match against (language-agnostic, lowercase). */
  keywords?: string[];
}

/** DOM id for a field anchor — kept in one place so the index and the anchors agree. */
export const configFieldDomId = (fieldId: string) => `cfg-field-${fieldId}`;

type Translate = (key: string) => string;

// Compact helper: every label/hint key lives under config_management.visual.
const L = (key: string) => `config_management.visual.${key}`;

export const CONFIG_FIELD_SEARCH_INDEX: ConfigFieldSearchEntry[] = [
  // ── connectivity ──────────────────────────────────────────────────────────
  {
    fieldId: 'host',
    sectionId: 'connectivity',
    labelKey: L('sections.server.host'),
    yamlKeys: ['host'],
  },
  {
    fieldId: 'port',
    sectionId: 'connectivity',
    labelKey: L('sections.server.port'),
    yamlKeys: ['port'],
  },
  {
    fieldId: 'authDir',
    sectionId: 'connectivity',
    labelKey: L('sections.auth.auth_dir'),
    hintKey: L('sections.auth.auth_dir_hint'),
    yamlKeys: ['auth-dir'],
  },
  {
    fieldId: 'apiKeys',
    sectionId: 'connectivity',
    labelKey: L('api_keys.label'),
    yamlKeys: ['api-keys'],
    keywords: ['api key', 'apikey', 'token'],
  },
  {
    fieldId: 'tlsEnable',
    sectionId: 'connectivity',
    labelKey: L('sections.tls.enable'),
    hintKey: L('sections.tls.enable_desc'),
    yamlKeys: ['tls'],
    keywords: ['tls', 'ssl', 'https'],
  },
  {
    fieldId: 'tlsCert',
    sectionId: 'connectivity',
    labelKey: L('sections.tls.cert'),
    yamlKeys: ['tls', 'cert'],
    keywords: ['tls', 'ssl', 'certificate'],
  },
  {
    fieldId: 'tlsKey',
    sectionId: 'connectivity',
    labelKey: L('sections.tls.key'),
    yamlKeys: ['tls', 'key'],
    keywords: ['tls', 'ssl', 'private key'],
  },
  {
    fieldId: 'rmAllowRemote',
    sectionId: 'connectivity',
    labelKey: L('sections.remote.allow_remote'),
    hintKey: L('sections.remote.allow_remote_desc'),
    yamlKeys: ['remote-management', 'allow-remote'],
  },
  {
    fieldId: 'rmDisableControlPanel',
    sectionId: 'connectivity',
    labelKey: L('sections.remote.disable_panel'),
    yamlKeys: ['remote-management', 'disable-control-panel'],
  },
  {
    fieldId: 'rmDisableAutoUpdatePanel',
    sectionId: 'connectivity',
    labelKey: L('sections.remote.disable_auto_update_panel'),
    yamlKeys: ['remote-management', 'disable-auto-update-panel'],
  },
  {
    fieldId: 'rmSecretKey',
    sectionId: 'connectivity',
    labelKey: L('sections.remote.secret_key'),
    yamlKeys: ['remote-management', 'secret-key'],
  },
  {
    fieldId: 'rmPanelRepo',
    sectionId: 'connectivity',
    labelKey: L('sections.remote.panel_repo'),
    yamlKeys: ['remote-management', 'panel-github-repository'],
  },
  // ── network ───────────────────────────────────────────────────────────────
  {
    fieldId: 'proxyUrl',
    sectionId: 'network',
    labelKey: L('sections.network.proxy_url'),
    yamlKeys: ['proxy-url'],
  },
  {
    fieldId: 'requestRetry',
    sectionId: 'network',
    labelKey: L('sections.network.request_retry'),
    yamlKeys: ['request-retry'],
  },
  {
    fieldId: 'maxRetryCredentials',
    sectionId: 'network',
    labelKey: L('sections.network.max_retry_credentials'),
    hintKey: L('sections.network.max_retry_credentials_hint'),
    yamlKeys: ['max-retry-credentials'],
  },
  {
    fieldId: 'maxRetryInterval',
    sectionId: 'network',
    labelKey: L('sections.network.max_retry_interval'),
    hintKey: L('sections.network.max_retry_interval_hint'),
    yamlKeys: ['max-retry-interval'],
  },
  {
    fieldId: 'authAutoRefreshWorkers',
    sectionId: 'network',
    labelKey: L('sections.network.auth_auto_refresh_workers'),
    hintKey: L('sections.network.auth_auto_refresh_workers_hint'),
    yamlKeys: ['auth-auto-refresh-workers'],
  },
  {
    fieldId: 'routingStrategy',
    sectionId: 'network',
    labelKey: L('sections.network.routing_strategy'),
    hintKey: L('sections.network.routing_strategy_hint'),
    yamlKeys: ['routing', 'strategy'],
    keywords: ['round-robin', 'weighted-round-robin', 'wrr', 'fill-first'],
  },
  {
    fieldId: 'disableImageGeneration',
    sectionId: 'network',
    labelKey: L('sections.network.disable_image_generation'),
    hintKey: L('sections.network.disable_image_generation_hint'),
    yamlKeys: ['disable-image-generation'],
    keywords: ['false', 'true', 'chat', 'passthrough'],
  },
  {
    fieldId: 'gptImage2BaseModel',
    sectionId: 'network',
    labelKey: L('sections.network.gpt_image_2_base_model'),
    hintKey: L('sections.network.gpt_image_2_base_model_hint'),
    yamlKeys: ['gpt-image-2-base-model'],
  },
  {
    fieldId: 'routingSessionAffinityTTL',
    sectionId: 'network',
    labelKey: L('sections.network.session_affinity_ttl'),
    yamlKeys: ['routing', 'session-affinity-ttl'],
  },
  {
    fieldId: 'forceModelPrefix',
    sectionId: 'network',
    labelKey: L('sections.network.force_model_prefix'),
    hintKey: L('sections.network.force_model_prefix_desc'),
    yamlKeys: ['force-model-prefix'],
  },
  {
    fieldId: 'passthroughHeaders',
    sectionId: 'network',
    labelKey: L('sections.network.passthrough_headers'),
    hintKey: L('sections.network.passthrough_headers_desc'),
    yamlKeys: ['passthrough-headers'],
  },
  {
    fieldId: 'disableCooling',
    sectionId: 'network',
    labelKey: L('sections.network.disable_cooling'),
    hintKey: L('sections.network.disable_cooling_desc'),
    yamlKeys: ['disable-cooling'],
  },
  {
    fieldId: 'routingSessionAffinity',
    sectionId: 'network',
    labelKey: L('sections.network.session_affinity'),
    yamlKeys: ['routing', 'session-affinity'],
  },
  {
    fieldId: 'wsAuth',
    sectionId: 'network',
    labelKey: L('sections.network.ws_auth'),
    hintKey: L('sections.network.ws_auth_desc'),
    yamlKeys: ['ws-auth'],
    keywords: ['websocket'],
  },
  // ── logging ───────────────────────────────────────────────────────────────
  {
    fieldId: 'debug',
    sectionId: 'logging',
    labelKey: L('sections.system.debug'),
    hintKey: L('sections.system.debug_desc'),
    yamlKeys: ['debug'],
  },
  {
    fieldId: 'commercialMode',
    sectionId: 'logging',
    labelKey: L('sections.system.commercial_mode'),
    hintKey: L('sections.system.commercial_mode_desc'),
    yamlKeys: ['commercial-mode'],
  },
  {
    fieldId: 'loggingToFile',
    sectionId: 'logging',
    labelKey: L('sections.system.logging_to_file'),
    hintKey: L('sections.system.logging_to_file_desc'),
    yamlKeys: ['logging-to-file'],
  },
  {
    fieldId: 'logsMaxTotalSizeMb',
    sectionId: 'logging',
    labelKey: L('sections.system.logs_max_size'),
    yamlKeys: ['logs-max-total-size-mb'],
  },
  {
    fieldId: 'errorLogsMaxFiles',
    sectionId: 'logging',
    labelKey: L('sections.system.error_logs_max_files'),
    yamlKeys: ['error-logs-max-files'],
  },
  {
    fieldId: 'redisUsageQueueRetentionSeconds',
    sectionId: 'logging',
    labelKey: L('sections.system.redis_usage_retention'),
    hintKey: L('sections.system.redis_usage_retention_hint'),
    yamlKeys: ['redis-usage-queue-retention-seconds'],
  },
  {
    fieldId: 'usageStatisticsEnabled',
    sectionId: 'logging',
    labelKey: L('sections.system.usage_statistics_enabled'),
    hintKey: L('sections.system.usage_statistics_enabled_desc'),
    yamlKeys: ['usage-statistics-enabled'],
  },
  // ── quota ─────────────────────────────────────────────────────────────────
  {
    fieldId: 'quotaSwitchProject',
    sectionId: 'quota',
    labelKey: L('sections.quota.switch_project'),
    hintKey: L('sections.quota.switch_project_desc'),
    yamlKeys: ['quota-exceeded', 'switch-project'],
  },
  {
    fieldId: 'quotaSwitchPreviewModel',
    sectionId: 'quota',
    labelKey: L('sections.quota.switch_preview_model'),
    hintKey: L('sections.quota.switch_preview_model_desc'),
    yamlKeys: ['quota-exceeded', 'switch-preview-model'],
  },
  {
    fieldId: 'quotaAntigravityCredits',
    sectionId: 'quota',
    labelKey: L('sections.quota.antigravity_credits'),
    yamlKeys: ['quota-exceeded', 'antigravity-credits'],
  },
  // ── streaming ─────────────────────────────────────────────────────────────
  {
    fieldId: 'streamingKeepaliveSeconds',
    sectionId: 'streaming',
    labelKey: L('sections.streaming.keepalive_seconds'),
    hintKey: L('sections.streaming.keepalive_hint'),
    yamlKeys: ['streaming', 'keepalive-seconds'],
  },
  {
    fieldId: 'streamingBootstrapRetries',
    sectionId: 'streaming',
    labelKey: L('sections.streaming.bootstrap_retries'),
    hintKey: L('sections.streaming.bootstrap_hint'),
    yamlKeys: ['streaming', 'bootstrap-retries'],
  },
  {
    fieldId: 'streamingNonstreamKeepalive',
    sectionId: 'streaming',
    labelKey: L('sections.streaming.nonstream_keepalive'),
    hintKey: L('sections.streaming.nonstream_keepalive_hint'),
    yamlKeys: ['streaming', 'nonstream-keepalive-interval'],
  },
  // ── advanced ──────────────────────────────────────────────────────────────
  {
    fieldId: 'pluginsEnabled',
    sectionId: 'advanced',
    labelKey: L('sections.system.plugins_enabled'),
    hintKey: L('sections.system.plugins_enabled_desc'),
    yamlKeys: ['plugins'],
  },
  {
    fieldId: 'pluginStoreSources',
    sectionId: 'advanced',
    labelKey: L('sections.system.plugin_store_sources'),
    hintKey: L('sections.system.plugin_store_sources_hint'),
    yamlKeys: ['plugins', 'store-sources'],
  },
  {
    fieldId: 'pluginStoreAuth',
    sectionId: 'advanced',
    labelKey: L('sections.system.plugin_store_auth'),
    hintKey: L('sections.system.plugin_store_auth_hint'),
    yamlKeys: ['plugins', 'store-auth'],
  },
  {
    fieldId: 'antigravitySensitiveWords',
    sectionId: 'advanced',
    labelKey: L('sections.system.antigravity_sensitive_words'),
    hintKey: L('sections.system.antigravity_sensitive_words_desc'),
    yamlKeys: ['antigravity', 'sensitive-words'],
    keywords: ['antigravity', 'obfuscate', 'zero-width'],
  },
  {
    fieldId: 'devinSensitiveWords',
    sectionId: 'advanced',
    labelKey: L('sections.system.devin_sensitive_words'),
    hintKey: L('sections.system.devin_sensitive_words_desc'),
    yamlKeys: ['devin', 'sensitive-words'],
    keywords: ['devin', 'system prompt', 'remove line', 'obfuscate', 'zero-width'],
  },
  {
    fieldId: 'antigravitySignatureCacheEnabled',
    sectionId: 'advanced',
    labelKey: L('sections.system.antigravity_signature_cache'),
    hintKey: L('sections.system.antigravity_signature_cache_desc'),
    yamlKeys: ['antigravity-signature-cache-enabled'],
  },
  {
    fieldId: 'antigravitySignatureBypassStrict',
    sectionId: 'advanced',
    labelKey: L('sections.system.antigravity_signature_strict'),
    hintKey: L('sections.system.antigravity_signature_strict_desc'),
    yamlKeys: ['antigravity-signature-bypass-strict'],
  },
  // Claude header defaults — qualifierKey disambiguates the shared "User-Agent" label.
  {
    fieldId: 'claudeHeaderUserAgent',
    sectionId: 'advanced',
    labelKey: L('sections.headers.user_agent'),
    qualifierKey: L('sections.headers.claude_title'),
    yamlKeys: ['claude-header-defaults', 'user-agent'],
    keywords: ['claude'],
  },
  {
    fieldId: 'claudeHeaderPackageVersion',
    sectionId: 'advanced',
    labelKey: L('sections.headers.package_version'),
    qualifierKey: L('sections.headers.claude_title'),
    yamlKeys: ['claude-header-defaults', 'package-version'],
    keywords: ['claude'],
  },
  {
    fieldId: 'claudeHeaderRuntimeVersion',
    sectionId: 'advanced',
    labelKey: L('sections.headers.runtime_version'),
    qualifierKey: L('sections.headers.claude_title'),
    yamlKeys: ['claude-header-defaults', 'runtime-version'],
    keywords: ['claude'],
  },
  {
    fieldId: 'claudeHeaderOs',
    sectionId: 'advanced',
    labelKey: L('sections.headers.os'),
    qualifierKey: L('sections.headers.claude_title'),
    yamlKeys: ['claude-header-defaults', 'os'],
    keywords: ['claude'],
  },
  {
    fieldId: 'claudeHeaderArch',
    sectionId: 'advanced',
    labelKey: L('sections.headers.arch'),
    qualifierKey: L('sections.headers.claude_title'),
    yamlKeys: ['claude-header-defaults', 'arch'],
    keywords: ['claude'],
  },
  {
    fieldId: 'claudeHeaderTimeout',
    sectionId: 'advanced',
    labelKey: L('sections.headers.timeout'),
    qualifierKey: L('sections.headers.claude_title'),
    yamlKeys: ['claude-header-defaults', 'timeout'],
    keywords: ['claude'],
  },
  {
    fieldId: 'claudeHeaderStabilizeDeviceProfile',
    sectionId: 'advanced',
    labelKey: L('sections.headers.stabilize_device'),
    qualifierKey: L('sections.headers.claude_title'),
    hintKey: L('sections.headers.stabilize_device_desc'),
    yamlKeys: ['claude-header-defaults', 'stabilize-device-profile'],
    keywords: ['claude'],
  },
  // Codex header defaults.
  {
    fieldId: 'codexHeaderUserAgent',
    sectionId: 'advanced',
    labelKey: L('sections.headers.user_agent'),
    qualifierKey: L('sections.headers.codex_title'),
    yamlKeys: ['codex-header-defaults', 'user-agent'],
    keywords: ['codex'],
  },
  {
    fieldId: 'codexHeaderBetaFeatures',
    sectionId: 'advanced',
    labelKey: L('sections.headers.beta_features'),
    qualifierKey: L('sections.headers.codex_title'),
    yamlKeys: ['codex-header-defaults', 'beta-features'],
    keywords: ['codex'],
  },
  // ── payload (coarse: one entry per rule group) ──────────────────────────────
  {
    fieldId: 'payloadDefaultRules',
    sectionId: 'payload',
    labelKey: L('sections.payload.default_rules'),
    hintKey: L('sections.payload.default_rules_desc'),
    keywords: ['payload', 'rule'],
  },
  {
    fieldId: 'payloadDefaultRawRules',
    sectionId: 'payload',
    labelKey: L('sections.payload.default_raw_rules'),
    hintKey: L('sections.payload.default_raw_rules_desc'),
    keywords: ['payload', 'rule', 'json'],
  },
  {
    fieldId: 'payloadOverrideRules',
    sectionId: 'payload',
    labelKey: L('sections.payload.override_rules'),
    hintKey: L('sections.payload.override_rules_desc'),
    keywords: ['payload', 'rule'],
  },
  {
    fieldId: 'payloadOverrideRawRules',
    sectionId: 'payload',
    labelKey: L('sections.payload.override_raw_rules'),
    hintKey: L('sections.payload.override_raw_rules_desc'),
    keywords: ['payload', 'rule', 'json'],
  },
  {
    fieldId: 'payloadFilterRules',
    sectionId: 'payload',
    labelKey: L('sections.payload.filter_rules'),
    hintKey: L('sections.payload.filter_rules_desc'),
    keywords: ['payload', 'rule', 'filter'],
  },
  // ── prompts ──────────────────────────────────────────────────────────────────
  {
    fieldId: 'promptsEnabled',
    sectionId: 'prompts',
    labelKey: L('sections.prompts.enabled'),
    hintKey: L('sections.prompts.enabled_desc'),
    yamlKeys: ['prompts', 'enabled'],
    keywords: ['prompt', 'injection'],
  },
  {
    fieldId: 'promptsDefaultSystem',
    sectionId: 'prompts',
    labelKey: L('sections.prompts.default_system'),
    hintKey: L('sections.prompts.default_system_desc'),
    yamlKeys: ['prompts', 'default', 'system'],
    keywords: ['prompt', 'system'],
  },
  {
    fieldId: 'promptsDefaultSystemMode',
    sectionId: 'prompts',
    labelKey: L('sections.prompts.default_system_mode'),
    hintKey: L('sections.prompts.default_system_mode_desc'),
    yamlKeys: ['prompts', 'default', 'system-mode'],
    keywords: ['prompt', 'merge', 'replace', 'prepend'],
  },
  {
    fieldId: 'promptsDefaultPrependUser',
    sectionId: 'prompts',
    labelKey: L('sections.prompts.default_prepend_user'),
    hintKey: L('sections.prompts.default_prepend_user_desc'),
    yamlKeys: ['prompts', 'default', 'prepend-user'],
    keywords: ['prompt', 'prepend', 'user'],
  },
  {
    fieldId: 'promptsDefaultAppendUser',
    sectionId: 'prompts',
    labelKey: L('sections.prompts.default_append_user'),
    hintKey: L('sections.prompts.default_append_user_desc'),
    yamlKeys: ['prompts', 'default', 'append-user'],
    keywords: ['prompt', 'append', 'user'],
  },
  {
    fieldId: 'promptsPresets',
    sectionId: 'prompts',
    labelKey: L('sections.prompts.presets'),
    hintKey: L('sections.prompts.presets_desc'),
    yamlKeys: ['prompts', 'presets'],
    keywords: ['prompt', 'preset'],
  },
  // ── promptNorm ─────────────────────────────────────────────────────────────────
  {
    fieldId: 'promptNormEnabled',
    sectionId: 'promptNorm',
    labelKey: L('sections.promptNorm.enabled'),
    hintKey: L('sections.promptNorm.enabled_desc'),
    yamlKeys: ['prompt_norm', 'enabled'],
    keywords: ['prompt', 'normalization', 'context'],
  },
  {
    fieldId: 'promptNormMaxContextTokens',
    sectionId: 'promptNorm',
    labelKey: L('sections.promptNorm.max_context_tokens'),
    hintKey: L('sections.promptNorm.max_context_tokens_desc'),
    yamlKeys: ['prompt_norm', 'max-context-tokens'],
    keywords: ['prompt', 'tokens', 'context', 'limit'],
  },
  {
    fieldId: 'promptNormPreserveLastNBlocks',
    sectionId: 'promptNorm',
    labelKey: L('sections.promptNorm.preserve_last_n_blocks'),
    hintKey: L('sections.promptNorm.preserve_last_n_blocks_desc'),
    yamlKeys: ['prompt_norm', 'preserve-last-n-blocks'],
    keywords: ['prompt', 'blocks', 'preserve'],
  },
  {
    fieldId: 'promptNormMinDropTokens',
    sectionId: 'promptNorm',
    labelKey: L('sections.promptNorm.min_drop_tokens'),
    hintKey: L('sections.promptNorm.min_drop_tokens_desc'),
    yamlKeys: ['prompt_norm', 'min-drop-tokens'],
    keywords: ['prompt', 'tokens', 'min', 'drop'],
  },
  {
    fieldId: 'promptNormMaxDropRatio',
    sectionId: 'promptNorm',
    labelKey: L('sections.promptNorm.max_drop_ratio'),
    hintKey: L('sections.promptNorm.max_drop_ratio_desc'),
    yamlKeys: ['prompt_norm', 'max-drop-ratio'],
    keywords: ['prompt', 'ratio', 'drop', 'limit'],
  },
  {
    fieldId: 'promptNormTruncateHeadKeep',
    sectionId: 'promptNorm',
    labelKey: L('sections.promptNorm.truncate_head_keep'),
    hintKey: L('sections.promptNorm.truncate_head_keep_desc'),
    yamlKeys: ['prompt_norm', 'truncate-head-keep'],
    keywords: ['prompt', 'truncate', 'head', 'keep'],
  },
  {
    fieldId: 'promptNormTruncateTailKeep',
    sectionId: 'promptNorm',
    labelKey: L('sections.promptNorm.truncate_tail_keep'),
    hintKey: L('sections.promptNorm.truncate_tail_keep_desc'),
    yamlKeys: ['prompt_norm', 'truncate-tail-keep'],
    keywords: ['prompt', 'truncate', 'tail', 'keep'],
  },
  {
    fieldId: 'promptNormPruneToolResults',
    sectionId: 'promptNorm',
    labelKey: L('sections.promptNorm.prune_tool_results'),
    hintKey: L('sections.promptNorm.prune_tool_results_desc'),
    yamlKeys: ['prompt_norm', 'prune-tool-results'],
    keywords: ['prompt', 'tool', 'results', 'prune'],
  },
  {
    fieldId: 'promptNormSelectSystemPrompt',
    sectionId: 'promptNorm',
    labelKey: L('sections.promptNorm.select_system_prompt'),
    hintKey: L('sections.promptNorm.select_system_prompt_desc'),
    yamlKeys: ['prompt_norm', 'select-system-prompt'],
    keywords: ['prompt', 'system', 'select'],
  },
  {
    fieldId: 'promptNormSystemPromptMode',
    sectionId: 'promptNorm',
    labelKey: L('sections.promptNorm.system_prompt_mode'),
    hintKey: L('sections.promptNorm.system_prompt_mode_desc'),
    yamlKeys: ['prompt_norm', 'system-prompt-mode'],
    keywords: ['prompt', 'system', 'mode', 'merge', 'replace'],
  },
  {
    fieldId: 'promptNormAllowPrefixMutation',
    sectionId: 'promptNorm',
    labelKey: L('sections.promptNorm.allow_prefix_mutation'),
    hintKey: L('sections.promptNorm.allow_prefix_mutation_desc'),
    yamlKeys: ['prompt_norm', 'allow-prefix-mutation'],
    keywords: ['prompt', 'prefix', 'mutation', 'cache'],
  },
  {
    fieldId: 'promptNormPromptOverrides',
    sectionId: 'promptNorm',
    labelKey: L('sections.promptNorm.prompt_overrides'),
    hintKey: L('sections.promptNorm.prompt_overrides_desc'),
    yamlKeys: ['prompt_norm', 'prompt-overrides'],
    keywords: ['prompt', 'overrides', 'custom', 'model'],
  },
  {
    fieldId: 'promptNormDebugLog',
    sectionId: 'promptNorm',
    labelKey: L('sections.promptNorm.debug_log'),
    hintKey: L('sections.promptNorm.debug_log_desc'),
    yamlKeys: ['prompt_norm', 'debug-log'],
    keywords: ['prompt', 'debug', 'log'],
  },
  // ── rtk ──────────────────────────────────────────────────────────────────────
  {
    fieldId: 'rtkEnabled',
    sectionId: 'rtk',
    labelKey: L('sections.rtk.enabled'),
    hintKey: L('sections.rtk.enabled_desc'),
    yamlKeys: ['rtk', 'enabled'],
    keywords: ['rtk', 'kommando'],
  },
  {
    fieldId: 'rtkBinary',
    sectionId: 'rtk',
    labelKey: L('sections.rtk.binary'),
    hintKey: L('sections.rtk.binary_desc'),
    yamlKeys: ['rtk', 'binary'],
    keywords: ['rtk', 'binary', 'path'],
  },
  {
    fieldId: 'rtkUltraMode',
    sectionId: 'rtk',
    labelKey: L('sections.rtk.ultra_mode'),
    hintKey: L('sections.rtk.ultra_mode_desc'),
    yamlKeys: ['rtk', 'ultra-mode'],
    keywords: ['rtk', 'ultra'],
  },
  {
    fieldId: 'rtkPoolSize',
    sectionId: 'rtk',
    labelKey: L('sections.rtk.pool_size'),
    hintKey: L('sections.rtk.pool_size_desc'),
    yamlKeys: ['rtk', 'pool-size'],
    keywords: ['rtk', 'pool', 'worker'],
  },
  {
    fieldId: 'rtkTimeout',
    sectionId: 'rtk',
    labelKey: L('sections.rtk.timeout'),
    hintKey: L('sections.rtk.timeout_desc'),
    yamlKeys: ['rtk', 'timeout'],
    keywords: ['rtk', 'timeout'],
  },
  // ── caveman ──────────────────────────────────────────────────────────────────
  {
    fieldId: 'cavemanEnabled',
    sectionId: 'caveman',
    labelKey: L('sections.caveman.enabled'),
    hintKey: L('sections.caveman.enabled_desc'),
    yamlKeys: ['caveman', 'enabled'],
    keywords: ['caveman', 'compression'],
  },
  {
    fieldId: 'cavemanLevel',
    sectionId: 'caveman',
    labelKey: L('sections.caveman.level'),
    hintKey: L('sections.caveman.level_desc'),
    yamlKeys: ['caveman', 'level'],
    keywords: ['caveman', 'lite', 'full', 'ultra'],
  },
  {
    fieldId: 'cavemanCacheSize',
    sectionId: 'caveman',
    labelKey: L('sections.caveman.cache_size'),
    hintKey: L('sections.caveman.cache_size_desc'),
    yamlKeys: ['caveman', 'cache-size'],
    keywords: ['caveman', 'cache', 'lru'],
  },
  {
    fieldId: 'cavemanThreshold',
    sectionId: 'caveman',
    labelKey: L('sections.caveman.threshold'),
    hintKey: L('sections.caveman.threshold_desc'),
    yamlKeys: ['caveman', 'threshold'],
    keywords: ['caveman', 'threshold', 'min-length'],
  },
  // ── advancedConfigs ──────────────────────────────────────────────────────────
  {
    fieldId: 'credentialConcurrencyLifecycleConfigRevision',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.lifecycle_config_revision_label'),
  },
  {
    fieldId: 'credentialConcurrencyObservationBarrierRevision',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.observation_barrier_revision_label'),
  },
  {
    fieldId: 'credentialConcurrencyCPAHeartbeatTimeout',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.cpa_heartbeat_timeout_label'),
  },
  {
    fieldId: 'credentialConcurrencyCPACancelBound',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.cpa_cancel_bound_label'),
  },
  {
    fieldId: 'credentialConcurrencyReclaimGrace',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.reclaim_grace_label'),
  },
  {
    fieldId: 'credentialConcurrencyCleanupInterval',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.cleanup_interval_label'),
  },
  {
    fieldId: 'credentialConcurrencyReleaseFlushInterval',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.release_flush_interval_label'),
  },
  {
    fieldId: 'credentialConcurrencyReleaseMaxBackoff',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.release_max_backoff_label'),
  },
  {
    fieldId: 'credentialConcurrencyBusyRetryMin',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.busy_retry_min_label'),
  },
  {
    fieldId: 'credentialConcurrencyBusyRetryMax',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.busy_retry_max_label'),
  },
  {
    fieldId: 'credentialConcurrencyMaxLimit',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.max_limit_label'),
  },
  {
    fieldId: 'credentialInFlightSnapshotInterval',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.snapshot_interval_label'),
  },
  {
    fieldId: 'credentialInFlightStaleAfter',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.stale_after_label'),
  },
  {
    fieldId: 'credentialInFlightMaxPartBytes',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.max_part_bytes_label'),
  },
  {
    fieldId: 'credentialInFlightMaxPartCount',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.max_part_count_label'),
  },
  {
    fieldId: 'credentialInFlightMaxRevisionBytes',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.max_revision_bytes_label'),
  },
  {
    fieldId: 'credentialInFlightMaxAggregateGroups',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.max_aggregate_groups_label'),
  },
  {
    fieldId: 'credentialInFlightMaxDetails',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.max_details_label'),
  },
  {
    fieldId: 'credentialInFlightMaxStringBytes',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.max_string_bytes_label'),
  },
  {
    fieldId: 'credentialInFlightStagingRetention',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.staging_retention_label'),
  },
  {
    fieldId: 'aiAgentEnabled',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.ai_agent_enabled_label'),
  },
  {
    fieldId: 'aiAgentMode',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.mode_label'),
  },
  {
    fieldId: 'aiAgentRoutingBackend',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.routing_backend_label'),
  },
  {
    fieldId: 'aiAgentTiAgentURL',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.tiagent_url_label'),
  },
  {
    fieldId: 'aiAgentTiAgentTimeout',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.tiagent_timeout_label'),
  },
  {
    fieldId: 'aiAgentFallbackToStatic',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.fallback_to_static_label'),
  },
  {
    fieldId: 'aiAgentCacheTTLSeconds',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.cache_ttl_seconds_label'),
  },
  {
    fieldId: 'aiAgentDefaultProvider',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.default_provider_label'),
  },
  {
    fieldId: 'aiAgentCostWeight',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.cost_weight_label'),
  },
  {
    fieldId: 'aiAgentLatencyWeight',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.latency_weight_label'),
  },
  {
    fieldId: 'aiAgentQualityWeight',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.quality_weight_label'),
  },
  {
    fieldId: 'transientErrorCooldownSeconds',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.transient_error_cooldown_seconds_label'),
  },
  {
    fieldId: 'tokenRotationEnabled',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.token_rotation_enabled_label'),
  },
  {
    fieldId: 'tokenRotationRefreshBufferSeconds',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.token_rotation_refresh_buffer_seconds_label'),
  },
  {
    fieldId: 'disableClaudeCloakMode',
    sectionId: 'advancedConfigs',
    labelKey: L('sections.advancedConfigs.disable_claude_cloak_mode_label'),
  },
  // ── infrastructure ──────────────────────────────────────────────────────────
  {
    fieldId: 'pprofEnable',
    sectionId: 'infrastructure',
    labelKey: L('sections.infrastructure.pprof_enable_label'),
  },
  {
    fieldId: 'pprofAddr',
    sectionId: 'infrastructure',
    labelKey: L('sections.infrastructure.pprof_addr_label'),
  },
  {
    fieldId: 'metricsEnabled',
    sectionId: 'infrastructure',
    labelKey: L('sections.infrastructure.metrics_enabled_label'),
  },
  {
    fieldId: 'metricsPath',
    sectionId: 'infrastructure',
    labelKey: L('sections.infrastructure.metrics_path_label'),
  },
  {
    fieldId: 'logsRotationMaxSizeMB',
    sectionId: 'infrastructure',
    labelKey: L('sections.infrastructure.max_size_mb_label'),
  },
  {
    fieldId: 'logsRotationMaxAgeDays',
    sectionId: 'infrastructure',
    labelKey: L('sections.infrastructure.max_age_days_label'),
  },
  {
    fieldId: 'logsRotationMaxBackups',
    sectionId: 'infrastructure',
    labelKey: L('sections.infrastructure.max_backups_label'),
  },
  {
    fieldId: 'logsRotationCompress',
    sectionId: 'infrastructure',
    labelKey: L('sections.infrastructure.compress_label'),
  },
  {
    fieldId: 'semanticCacheEnabled',
    sectionId: 'infrastructure',
    labelKey: L('sections.infrastructure.semantic_cache_enabled_label'),
  },
  {
    fieldId: 'semanticCacheSimilarityThreshold',
    sectionId: 'infrastructure',
    labelKey: L('sections.infrastructure.similarity_threshold_label'),
  },
  {
    fieldId: 'semanticCacheMaxEntries',
    sectionId: 'infrastructure',
    labelKey: L('sections.infrastructure.max_entries_label'),
  },
  {
    fieldId: 'semanticCacheTTL',
    sectionId: 'infrastructure',
    labelKey: L('sections.infrastructure.ttl_label'),
  },
  {
    fieldId: 'semanticCacheEmbeddingModel',
    sectionId: 'infrastructure',
    labelKey: L('sections.infrastructure.embedding_model_label'),
  },
  {
    fieldId: 'semanticCacheEmbeddingModelPath',
    sectionId: 'infrastructure',
    labelKey: L('sections.infrastructure.embedding_model_path_label'),
  },
  {
    fieldId: 'semanticCacheTokenizerPath',
    sectionId: 'infrastructure',
    labelKey: L('sections.infrastructure.tokenizer_path_label'),
  },
  {
    fieldId: 'semanticCacheCacheDir',
    sectionId: 'infrastructure',
    labelKey: L('sections.infrastructure.cache_dir_label'),
  },
  {
    fieldId: 'semanticCacheOnlyCache2xx',
    sectionId: 'infrastructure',
    labelKey: L('sections.infrastructure.only_cache_2xx_label'),
  },
  {
    fieldId: 'semanticCacheExcludeReasoningModels',
    sectionId: 'infrastructure',
    labelKey: L('sections.infrastructure.exclude_reasoning_models_label'),
  },
  {
    fieldId: 'modelCapabilitiesEnabled',
    sectionId: 'infrastructure',
    labelKey: L('sections.infrastructure.model_capabilities_enabled_label'),
  },
  {
    fieldId: 'modelCapabilitiesAutoDiscover',
    sectionId: 'infrastructure',
    labelKey: L('sections.infrastructure.auto_discover_label'),
  },
  {
    fieldId: 'modelCapabilitiesPersistToSQLite',
    sectionId: 'infrastructure',
    labelKey: L('sections.infrastructure.persist_to_sqlite_label'),
  },
  {
    fieldId: 'modelCapabilitiesCacheTTL',
    sectionId: 'infrastructure',
    labelKey: L('sections.infrastructure.cache_ttl_label'),
  },
  {
    fieldId: 'modelCapabilitiesCostRulesEnabled',
    sectionId: 'infrastructure',
    labelKey: L('sections.infrastructure.cost_rules_enabled_label'),
  },
  {
    fieldId: 'modelCapabilitiesCostRulesMonthlyBudgetUSD',
    sectionId: 'infrastructure',
    labelKey: L('sections.infrastructure.monthly_budget_usd_label'),
  },
  {
    fieldId: 'modelCapabilitiesCostRulesRules',
    sectionId: 'infrastructure',
    labelKey: L('sections.infrastructure.cost_rules_label'),
    hintKey: L('sections.infrastructure.cost_rules_hint'),
  },
  // ── llmFeatures ──────────────────────────────────────────────────────────
  {
    fieldId: 'intelligentRoutingEnabled',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.intelligent_routing_enabled_label'),
  },
  {
    fieldId: 'intelligentRoutingMode',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.mode_label'),
    hintKey: L('sections.llmFeatures.mode_hint'),
  },
  {
    fieldId: 'intelligentRoutingTriggerModels',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.trigger_models_label'),
    hintKey: L('sections.llmFeatures.trigger_models_hint'),
  },
  {
    fieldId: 'intelligentRoutingPreferredProviders',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.preferred_providers_label'),
    hintKey: L('sections.llmFeatures.preferred_providers_hint'),
  },
  {
    fieldId: 'intelligentRoutingDefaultBudget',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.default_budget_label'),
    hintKey: L('sections.llmFeatures.default_budget_hint'),
  },
  {
    fieldId: 'intelligentRoutingConfidenceThreshold',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.confidence_threshold_label'),
    hintKey: L('sections.llmFeatures.confidence_threshold_hint'),
  },
  {
    fieldId: 'intelligentRoutingDecisionCacheTTL',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.decision_cache_ttl_label'),
    hintKey: L('sections.llmFeatures.decision_cache_ttl_hint'),
  },
  {
    fieldId: 'llmRoutingEnabled',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.llm_routing_enabled_label'),
  },
  {
    fieldId: 'llmRoutingLLMProvider',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.llm_provider_label'),
    hintKey: L('sections.llmFeatures.llm_provider_hint'),
  },
  {
    fieldId: 'llmRoutingLLMModel',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.llm_model_label'),
    hintKey: L('sections.llmFeatures.llm_model_hint'),
  },
  {
    fieldId: 'llmRoutingCacheTTLSeconds',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.cache_ttl_seconds_label'),
  },
  {
    fieldId: 'llmRoutingTimeoutSeconds',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.timeout_seconds_label'),
  },
  {
    fieldId: 'llmRoutingFallbackToStatic',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.fallback_to_static_label'),
  },
  {
    fieldId: 'llmRoutingCostWeight',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.cost_weight_label'),
  },
  {
    fieldId: 'llmRoutingLatencyWeight',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.latency_weight_label'),
  },
  {
    fieldId: 'llmRoutingQualityWeight',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.quality_weight_label'),
  },
  {
    fieldId: 'llmRoutingAnalysisCompressionEnabled',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.analysis_compression_enabled_label'),
  },
  {
    fieldId: 'llmRoutingAnalysisCompressionStripNoise',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.strip_noise_label'),
  },
  {
    fieldId: 'llmRoutingAnalysisCompressionCompressRepeats',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.compress_repeats_label'),
  },
  {
    fieldId: 'llmRoutingAnalysisCompressionMaxPromptChars',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.max_prompt_chars_label'),
  },
  {
    fieldId: 'llmDiagnosticsEnabled',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.llm_diagnostics_enabled_label'),
  },
  {
    fieldId: 'llmDiagnosticsModelHint',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.model_hint_label'),
    hintKey: L('sections.llmFeatures.model_hint'),
  },
  {
    fieldId: 'llmDiagnosticsProviderHint',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.provider_hint_label'),
    hintKey: L('sections.llmFeatures.provider_hint'),
  },
  {
    fieldId: 'llmDiagnosticsErrorDiagnosisEnabled',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.error_diagnosis_enabled_label'),
  },
  {
    fieldId: 'llmDiagnosticsErrorDiagnosisCaptureStackTrace',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.capture_stack_trace_label'),
  },
  {
    fieldId: 'llmDiagnosticsErrorDiagnosisLogContextLines',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.log_context_lines_label'),
  },
  {
    fieldId: 'llmDiagnosticsErrorDiagnosisMinSeverity',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.min_severity_label'),
  },
  {
    fieldId: 'llmDiagnosticsErrorDiagnosisCooldown',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.cooldown_label'),
  },
  {
    fieldId: 'llmDiagnosticsLogAnalysisEnabled',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.log_analysis_enabled_label'),
  },
  {
    fieldId: 'llmDiagnosticsLogAnalysisInterval',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.interval_label'),
  },
  {
    fieldId: 'llmDiagnosticsLogAnalysisWindowSize',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.window_size_label'),
  },
  {
    fieldId: 'llmDiagnosticsLogAnalysisMaxEntries',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.max_entries_label'),
  },
  {
    fieldId: 'llmDiagnosticsLogAnalysisMinSeverity',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.min_severity_label'),
  },
  {
    fieldId: 'llmDiagnosticsLogAnalysisAlertOnAnomaly',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.alert_on_anomaly_label'),
  },
  {
    fieldId: 'llmFixSuggesterEnabled',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.llm_fix_suggester_enabled_label'),
  },
  {
    fieldId: 'llmFixSuggesterRecurrenceThreshold',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.recurrence_threshold_label'),
  },
  {
    fieldId: 'llmFixSuggesterTimeWindowHours',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.time_window_hours_label'),
  },
  {
    fieldId: 'llmFixSuggesterModelHint',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.model_hint_label'),
    hintKey: L('sections.llmFeatures.model_hint'),
  },
  {
    fieldId: 'llmFixSuggesterProviderHint',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.provider_hint_label'),
    hintKey: L('sections.llmFeatures.provider_hint'),
  },
  {
    fieldId: 'llmHealthQueryEnabled',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.llm_health_query_enabled_label'),
  },
  {
    fieldId: 'llmHealthQueryModelHint',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.model_hint_label'),
    hintKey: L('sections.llmFeatures.model_hint'),
  },
  {
    fieldId: 'llmHealthQueryProviderHint',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.provider_hint_label'),
    hintKey: L('sections.llmFeatures.provider_hint'),
  },
  {
    fieldId: 'llmHealthQueryTimeoutSeconds',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.timeout_seconds_label'),
  },
  {
    fieldId: 'llmClientCacheEnabled',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.llm_client_cache_enabled_label'),
  },
  {
    fieldId: 'llmClientCacheTTL',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.cache_ttl_label'),
  },
  {
    fieldId: 'llmClientCacheMaxItems',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.cache_max_items_label'),
  },
  {
    fieldId: 'llmClientModelHints',
    sectionId: 'llmFeatures',
    labelKey: L('sections.llmFeatures.model_hints_label'),
    hintKey: L('sections.llmFeatures.model_hints_hint'),
  },
  // ── protocolConfigs ──────────────────────────────────────────────────────────
  {
    fieldId: 'xaiLiveMediaRelayEnabled',
    sectionId: 'protocolConfigs',
    labelKey: L('sections.protocolConfigs.live_media_relay_enabled_label'),
  },
  {
    fieldId: 'xaiLiveMediaRelayMaxSessions',
    sectionId: 'protocolConfigs',
    labelKey: L('sections.protocolConfigs.max_sessions_label'),
  },
  {
    fieldId: 'xaiLiveMediaRelayDisablePrivateRemoteIPs',
    sectionId: 'protocolConfigs',
    labelKey: L('sections.protocolConfigs.disable_private_remote_ips_label'),
  },
  {
    fieldId: 'xaiLiveMediaRelayPublicIP',
    sectionId: 'protocolConfigs',
    labelKey: L('sections.protocolConfigs.public_ip_label'),
  },
  {
    fieldId: 'xaiLiveMediaRelayUDPPortMin',
    sectionId: 'protocolConfigs',
    labelKey: L('sections.protocolConfigs.udp_port_min_label'),
  },
  {
    fieldId: 'xaiLiveMediaRelayUDPPortMax',
    sectionId: 'protocolConfigs',
    labelKey: L('sections.protocolConfigs.udp_port_max_label'),
  },
  {
    fieldId: 'xaiLiveMediaRelayICEServers',
    sectionId: 'protocolConfigs',
    labelKey: L('sections.protocolConfigs.ice_servers_label'),
    hintKey: L('sections.protocolConfigs.ice_servers_hint'),
  },
  // ── quotaExtended ──────────────────────────────────────────────────────────
  {
    fieldId: 'quotaEnabled',
    sectionId: 'quotaExtended',
    labelKey: L('sections.quotaExtended.quota_enabled_label'),
  },
  {
    fieldId: 'quotaDailyLimit',
    sectionId: 'quotaExtended',
    labelKey: L('sections.quotaExtended.daily_limit_label'),
    hintKey: L('sections.quotaExtended.daily_limit_hint'),
  },
  {
    fieldId: 'quotaTokenLimit',
    sectionId: 'quotaExtended',
    labelKey: L('sections.quotaExtended.token_limit_label'),
    hintKey: L('sections.quotaExtended.token_limit_hint'),
  },
  {
    fieldId: 'quotaStoreDir',
    sectionId: 'quotaExtended',
    labelKey: L('sections.quotaExtended.store_dir_label'),
  },
  {
    fieldId: 'quotaAntigravityFamilyWindows',
    sectionId: 'quotaExtended',
    labelKey: L('sections.quotaExtended.family_windows_label'),
  },
  {
    fieldId: 'quotaCodexSessionScope',
    sectionId: 'quotaExtended',
    labelKey: L('sections.quotaExtended.session_scope_label'),
  },
  {
    fieldId: 'quotaCodexWeeklyScope',
    sectionId: 'quotaExtended',
    labelKey: L('sections.quotaExtended.weekly_scope_label'),
  },
  {
    fieldId: 'quotaCacheActiveTTL',
    sectionId: 'quotaExtended',
    labelKey: L('sections.quotaExtended.active_ttl_label'),
    hintKey: L('sections.quotaExtended.active_ttl_hint'),
  },
  {
    fieldId: 'quotaCacheExhaustedTTL',
    sectionId: 'quotaExtended',
    labelKey: L('sections.quotaExtended.exhausted_ttl_label'),
    hintKey: L('sections.quotaExtended.exhausted_ttl_hint'),
  },
  {
    fieldId: 'quotaCacheRefreshInterval',
    sectionId: 'quotaExtended',
    labelKey: L('sections.quotaExtended.refresh_interval_label'),
    hintKey: L('sections.quotaExtended.refresh_interval_hint'),
  },
  {
    fieldId: 'quotaCacheMaxConcurrentRefreshes',
    sectionId: 'quotaExtended',
    labelKey: L('sections.quotaExtended.max_concurrent_refreshes_label'),
  },
  {
    fieldId: 'quotaCachePersistToSQLite',
    sectionId: 'quotaExtended',
    labelKey: L('sections.quotaExtended.persist_to_sqlite_label'),
  },
  // ── routingExtended ──────────────────────────────────────────────────────────
  {
    fieldId: 'routingHealthCheckEnabled',
    sectionId: 'routingExtended',
    labelKey: L('sections.routingExtended.health_check_enabled_label'),
  },
  {
    fieldId: 'routingHealthCheckInterval',
    sectionId: 'routingExtended',
    labelKey: L('sections.routingExtended.interval_label'),
    hintKey: L('sections.routingExtended.interval_hint'),
  },
  {
    fieldId: 'routingHealthCheckTimeout',
    sectionId: 'routingExtended',
    labelKey: L('sections.routingExtended.timeout_label'),
    hintKey: L('sections.routingExtended.timeout_hint'),
  },
  {
    fieldId: 'routingHealthCheckFailureThreshold',
    sectionId: 'routingExtended',
    labelKey: L('sections.routingExtended.failure_threshold_label'),
  },
  {
    fieldId: 'routingHealthCheckSuccessThreshold',
    sectionId: 'routingExtended',
    labelKey: L('sections.routingExtended.success_threshold_label'),
  },
  {
    fieldId: 'routingCircuitBreakerEnabled',
    sectionId: 'routingExtended',
    labelKey: L('sections.routingExtended.circuit_breaker_enabled_label'),
  },
  {
    fieldId: 'routingCircuitBreakerFailureThreshold',
    sectionId: 'routingExtended',
    labelKey: L('sections.routingExtended.failure_threshold_label'),
  },
  {
    fieldId: 'routingCircuitBreakerSuccessThreshold',
    sectionId: 'routingExtended',
    labelKey: L('sections.routingExtended.success_threshold_label'),
  },
  {
    fieldId: 'routingCircuitBreakerTimeout',
    sectionId: 'routingExtended',
    labelKey: L('sections.routingExtended.timeout_label'),
    hintKey: L('sections.routingExtended.timeout_hint'),
  },
  {
    fieldId: 'routingFallbackEnabled',
    sectionId: 'routingExtended',
    labelKey: L('sections.routingExtended.fallback_enabled_label'),
  },
  {
    fieldId: 'routingFallbackPersistToSQLite',
    sectionId: 'routingExtended',
    labelKey: L('sections.routingExtended.persist_to_sqlite_label'),
  },
  {
    fieldId: 'routingFallbackDefaultChains',
    sectionId: 'routingExtended',
    labelKey: L('sections.routingExtended.default_chains_label'),
    hintKey: L('sections.routingExtended.default_chains_hint'),
  },
  {
    fieldId: 'routingChains',
    sectionId: 'routingExtended',
    labelKey: L('sections.routingExtended.chains_label'),
    hintKey: L('sections.routingExtended.chains_hint'),
  },
  {
    fieldId: 'routingPriorityFailoverEnabled',
    sectionId: 'routingExtended',
    labelKey: L('sections.routingExtended.priority_failover_enabled_label'),
  },
  {
    fieldId: 'routingPriorityFailoverDefaultChain',
    sectionId: 'routingExtended',
    labelKey: L('sections.routingExtended.default_chain_label'),
  },
  {
    fieldId: 'routingPriorityFailoverHealthCheckInterval',
    sectionId: 'routingExtended',
    labelKey: L('sections.routingExtended.health_check_interval_label'),
  },
  {
    fieldId: 'routingPriorityFailoverEnableManagementAPI',
    sectionId: 'routingExtended',
    labelKey: L('sections.routingExtended.enable_management_api_label'),
  },
];

const MAX_RESULTS = 8;

export function findConfigFieldById(
  fieldId: string | null | undefined
): ConfigFieldSearchEntry | undefined {
  if (!fieldId) return undefined;
  return CONFIG_FIELD_SEARCH_INDEX.find((entry) => entry.fieldId === fieldId);
}

/**
 * Lowercase substring search over label + qualifier + hint + YAML keys + keywords.
 * Returns the best ~8 matches, label/qualifier hits ranked above alias-only hits.
 */
export function searchConfigFields(query: string, t: Translate): ConfigFieldSearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const scored: { entry: ConfigFieldSearchEntry; score: number }[] = [];

  for (const entry of CONFIG_FIELD_SEARCH_INDEX) {
    const label = t(entry.labelKey).toLowerCase();
    const qualifier = entry.qualifierKey ? t(entry.qualifierKey).toLowerCase() : '';
    const hint = entry.hintKey ? t(entry.hintKey).toLowerCase() : '';
    const yaml = (entry.yamlKeys ?? []).join(' ').toLowerCase();
    const keywords = (entry.keywords ?? []).join(' ').toLowerCase();

    let score = Number.POSITIVE_INFINITY;
    if (label.startsWith(q)) score = 0;
    else if (label.includes(q)) score = 1;
    else if (qualifier.includes(q) || keywords.includes(q)) score = 2;
    else if (yaml.includes(q)) score = 3;
    else if (hint.includes(q)) score = 4;

    if (Number.isFinite(score)) scored.push({ entry, score });
  }

  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, MAX_RESULTS).map((item) => item.entry);
}
