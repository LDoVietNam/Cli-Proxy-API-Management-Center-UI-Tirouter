import type { ModelAlias } from './provider';

export type PayloadParamValueType = 'string' | 'number' | 'boolean' | 'json';
export type DisableImageGenerationMode = 'false' | 'true' | 'chat' | 'passthrough';
export type RoutingStrategy = 'round-robin' | 'weighted-round-robin' | 'fill-first';
export type PluginStoreAuthType = 'none' | 'bearer' | 'basic' | 'header' | 'github-token';
export type PluginStoreAuthApplyTo = 'registry' | 'metadata' | 'artifact';
export type PayloadParamValidationErrorCode =
  'payload_invalid_number' | 'payload_invalid_boolean' | 'payload_invalid_json';

export type VisualConfigFieldPath =
  | 'port'
  | 'errorLogsMaxFiles'
  | 'logsMaxTotalSizeMb'
  | 'redisUsageQueueRetentionSeconds'
  | 'requestRetry'
  | 'maxRetryCredentials'
  | 'maxRetryInterval'
  | 'authAutoRefreshWorkers'
  | 'streaming.keepaliveSeconds'
  | 'streaming.bootstrapRetries'
  | 'streaming.nonstreamKeepaliveInterval'
  | 'intelligentRouting.enabled'
  | 'intelligentRouting.mode'
  | 'intelligentRouting.confidenceThreshold'
  | 'intelligentRouting.decisionCacheTTL'
  | 'llmRouting.enabled'
  | 'llmRouting.llmProvider'
  | 'llmRouting.llmModel'
  | 'llmRouting.cacheTTLSeconds'
  | 'llmRouting.timeoutSeconds'
  | 'llmRouting.costWeight'
  | 'llmRouting.latencyWeight'
  | 'llmRouting.qualityWeight'
  | 'llmRouting.analysisCompression.enabled'
  | 'llmRouting.analysisCompression.stripNoise'
  | 'llmRouting.analysisCompression.compressRepeats'
  | 'llmRouting.analysisCompression.maxPromptChars'
  | 'llmDiagnostics.enabled'
  | 'llmDiagnostics.errorDiagnosis.enabled'
  | 'llmDiagnostics.errorDiagnosis.captureStackTrace'
  | 'llmDiagnostics.errorDiagnosis.logContextLines'
  | 'llmDiagnostics.errorDiagnosis.minSeverity'
  | 'llmDiagnostics.errorDiagnosis.cooldown'
  | 'llmDiagnostics.logAnalysis.enabled'
  | 'llmDiagnostics.logAnalysis.interval'
  | 'llmDiagnostics.logAnalysis.windowSize'
  | 'llmDiagnostics.logAnalysis.maxEntries'
  | 'llmDiagnostics.logAnalysis.minSeverity'
  | 'llmDiagnostics.logAnalysis.alertOnAnomaly'
  | 'llmFixSuggester.enabled'
  | 'llmFixSuggester.recurrenceThreshold'
  | 'llmFixSuggester.timeWindowHours'
  | 'llmHealthQuery.enabled'
  | 'llmHealthQuery.timeoutSeconds'
  | 'llmClient.cacheEnabled'
  | 'llmClient.cacheTTL'
  | 'llmClient.cacheMaxItems'
  | 'routing.healthCheck.enabled'
  | 'routing.healthCheck.interval'
  | 'routing.healthCheck.timeout'
  | 'routing.healthCheck.failureThreshold'
  | 'routing.healthCheck.successThreshold'
  | 'routing.circuitBreaker.enabled'
  | 'routing.circuitBreaker.failureThreshold'
  | 'routing.circuitBreaker.successThreshold'
  | 'routing.circuitBreaker.timeout'
  | 'routing.fallback.enabled'
  | 'routing.fallback.persistToSQLite'
  | 'routing.priorityFailover.enabled'
  | 'routing.priorityFailover.defaultChain'
  | 'routing.priorityFailover.healthCheckInterval'
  | 'routing.priorityFailover.enableManagementAPI'
  | 'quota.dailyLimit'
  | 'quota.tokenLimit'
  | 'quota.cache.activeTTL'
  | 'quota.cache.exhaustedTTL'
  | 'quota.cache.refreshInterval'
  | 'quota.cache.maxConcurrentRefreshes'
  | 'quota.cache.persistToSQLite'
  | 'payload.defaultRules'
  | 'payload.defaultRawRules'
  | 'payload.overrideRules'
  | 'payload.overrideRawRules'
  | 'payload.filterRules'
  | 'codexHeaderDefaults.userAgent'
  | 'codexHeaderDefaults.betaFeatures'
  | 'claudeHeaderDefaults.userAgent'
  | 'claudeHeaderDefaults.packageVersion'
  | 'claudeHeaderDefaults.runtimeVersion'
  | 'claudeHeaderDefaults.os'
  | 'claudeHeaderDefaults.arch'
  | 'claudeHeaderDefaults.timeout'
  | 'claudeHeaderDefaults.stabilizeDeviceProfile'
  | 'xai.liveMediaRelay.enabled'
  | 'xai.liveMediaRelay.maxSessions'
  | 'xai.liveMediaRelay.disablePrivateRemoteIPs'
  | 'xai.liveMediaRelay.publicIP'
  | 'xai.liveMediaRelay.udpPortMin'
  | 'xai.liveMediaRelay.udpPortMax'
  | 'tls.enabled'
  | 'tls.cert'
  | 'tls.key'
  | 'pprof.enabled'
  | 'pprof.addr'
  | 'metrics.enabled'
  | 'metrics.path'
  | 'logsRotation.maxSizeMB'
  | 'logsRotation.maxAgeDays'
  | 'logsRotation.maxBackups'
  | 'logsRotation.compress'
  | 'semanticCache.enabled'
  | 'semanticCache.similarityThreshold'
  | 'semanticCache.maxEntries'
  | 'semanticCache.ttl'
  | 'semanticCache.embeddingModel'
  | 'semanticCache.embeddingModelPath'
  | 'semanticCache.tokenizerPath'
  | 'semanticCache.cacheDir'
  | 'semanticCache.onlyCache2xx'
  | 'semanticCache.excludeReasoningModels'
  | 'modelCapabilities.enabled'
  | 'modelCapabilities.autoDiscover'
  | 'modelCapabilities.persistToSQLite'
  | 'modelCapabilities.cacheTTL'
  | 'modelCapabilities.costRules.enabled'
  | 'modelCapabilities.costRules.monthlyBudgetUSD'
  | 'credentialConcurrency.lifecycleConfigRevision'
  | 'credentialConcurrency.observationBarrierRevision'
  | 'credentialConcurrency.cpaHeartbeatTimeout'
  | 'credentialConcurrency.cpaCancelBound'
  | 'credentialConcurrency.reclaimGrace'
  | 'credentialConcurrency.cleanupInterval'
  | 'credentialConcurrency.releaseFlushInterval'
  | 'credentialConcurrency.releaseMaxBackoff'
  | 'credentialConcurrency.busyRetryMin'
  | 'credentialConcurrency.busyRetryMax'
  | 'credentialConcurrency.maxLimit'
  | 'credentialInFlight.snapshotInterval'
  | 'credentialInFlight.staleAfter'
  | 'credentialInFlight.maxPartBytes'
  | 'credentialInFlight.maxPartCount'
  | 'credentialInFlight.maxRevisionBytes'
  | 'credentialInFlight.maxAggregateGroups'
  | 'credentialInFlight.maxDetails'
  | 'credentialInFlight.maxStringBytes'
  | 'credentialInFlight.stagingRetention'
  | 'aiAgent.enabled'
  | 'aiAgent.mode'
  | 'aiAgent.routingBackend'
  | 'aiAgent.tiAgentURL'
  | 'aiAgent.tiAgentTimeout'
  | 'aiAgent.fallbackToStatic'
  | 'aiAgent.cacheTTLSeconds'
  | 'aiAgent.defaultProvider'
  | 'aiAgent.costWeight'
  | 'aiAgent.latencyWeight'
  | 'aiAgent.qualityWeight'
  | 'transientErrorCooldownSeconds'
  | 'authAutoRefreshWorkers'
  | 'tokenRotationEnabled'
  | 'tokenRotationRefreshBufferSeconds'
  | 'commercialMode'
  | 'antigravitySignatureCacheEnabled'
  | 'antigravitySignatureBypassStrict'
  | 'disableClaudeCloakMode';

export type VisualConfigValidationErrorCode =
  'port_range' | 'non_negative_integer' | 'integer_range_1_3600';

export type VisualConfigValidationErrors = Partial<
  Record<VisualConfigFieldPath, VisualConfigValidationErrorCode>
>;

export type PayloadParamEntry = {
  id: string;
  path: string;
  valueType: PayloadParamValueType;
  value: string;
};

export type PayloadHeaderEntry = {
  id: string;
  name: string;
  value: string;
};

export type PayloadModelEntry = {
  id: string;
  name: string;
  protocol?: string;
  fromProtocol?: string;
  headers?: PayloadHeaderEntry[];
  match?: PayloadParamEntry[];
  notMatch?: PayloadParamEntry[];
  exist?: string[];
  notExist?: string[];
};

export type PayloadRule = {
  id: string;
  models: PayloadModelEntry[];
  params: PayloadParamEntry[];
};

export type PayloadFilterRule = {
  id: string;
  models: PayloadModelEntry[];
  params: string[];
};

export interface StreamingConfig {
  keepaliveSeconds: string;
  bootstrapRetries: string;
  nonstreamKeepaliveInterval: string;
}

export type PluginStoreAuthRule = {
  id: string;
  match: string;
  applyTo: PluginStoreAuthApplyTo[];
  type: PluginStoreAuthType;
  tokenEnv: string;
  usernameEnv: string;
  passwordEnv: string;
  headerName: string;
  headerValueEnv: string;
  allowInsecure: boolean;
};

export type CavemanLevel = 'lite' | 'full' | 'ultra';

export type RTKConfig = {
  enabled: boolean;
  binary: string;
  ultraMode: boolean;
  poolSize: string;
  timeout: string;
};

export type CavemanConfig = {
  enabled: boolean;
  level: CavemanLevel;
  cacheSize: string;
  threshold: number;
};

// LLM Feature Config Types
export interface IntelligentRoutingConfig {
  enabled: boolean;
  mode: string;
  triggerModels: string[];
  preferredProviders: string[];
  defaultBudget: string;
  confidenceThreshold: number;
  decisionCacheTTL: string;
  modelAliases: ModelAlias[];
}

export interface LLMRoutingConfig {
  enabled: boolean;
  llmProvider: string;
  llmModel: string;
  cacheTTLSeconds: number;
  fallbackToStatic: boolean;
  timeoutSeconds: number;
  costWeight: number;
  latencyWeight: number;
  qualityWeight: number;
  analysisCompression: {
    enabled: boolean;
    stripNoise: boolean;
    compressRepeats: boolean;
    maxPromptChars: number;
  };
}

export interface LLMDiagnosticsConfig {
  enabled: boolean;
  modelHint: string;
  providerHint: string;
  errorDiagnosis: {
    enabled: boolean;
    captureStackTrace: boolean;
    logContextLines: number;
    minSeverity: string;
    cooldown: string;
  };
  logAnalysis: {
    enabled: boolean;
    interval: string;
    windowSize: string;
    maxEntries: number;
    minSeverity: string;
    alertOnAnomaly: boolean;
  };
}

export interface LLMFixSuggesterConfig {
  enabled: boolean;
  recurrenceThreshold: number;
  timeWindowHours: number;
  modelHint: string;
  providerHint: string;
}

export interface LLMHealthQueryConfig {
  enabled: boolean;
  modelHint: string;
  providerHint: string;
  timeoutSeconds: number;
}

export interface LLMClientConfig {
  cacheEnabled: boolean;
  cacheTTL: string;
  cacheMaxItems: number;
  modelHints: Record<string, string>;
}

// Routing Extended Config Types
export interface HealthCheckConfig {
  enabled: boolean;
  interval: string;
  timeout: string;
  failureThreshold: number;
  successThreshold: number;
}

export interface CircuitBreakerConfig {
  enabled: boolean;
  failureThreshold: number;
  successThreshold: number;
  timeout: string;
}

export interface FallbackRoutingConfig {
  enabled: boolean;
  persistToSQLite: boolean;
  defaultChains: Record<string, FallbackChainEntry[]>;
}

export interface FallbackChainEntry {
  provider: string;
  model?: string;
  strategy?: string;
  priority: number;
}

export interface PriorityChain {
  entries: ChainEntry[];
}

export interface ChainEntry {
  client?: string;
  provider?: string;
  model?: string;
  prefix?: string;
  weight?: number;
  priority?: number;
}

export interface PriorityFailoverConfig {
  enabled: boolean;
  defaultChain: string;
  healthCheckInterval: string;
  enableManagementAPI: boolean;
}

// Quota Extended Config Types
export interface QuotaCacheConfig {
  activeTTL: string;
  exhaustedTTL: string;
  refreshInterval: string;
  maxConcurrentRefreshes: number;
  persistToSQLite: boolean;
}

export interface QuotaAntigravityConfig {
  familyWindows: boolean;
}

export interface QuotaCodexConfig {
  sessionScope: boolean;
  weeklyScope: boolean;
}

export interface QuotaConfig {
  enabled: boolean;
  dailyLimit: number;
  tokenLimit: number;
  storeDir: string;
  cache: QuotaCacheConfig;
  antigravity: QuotaAntigravityConfig;
  codex: QuotaCodexConfig;
}

// Protocol Config Types
export interface CodexHeaderDefaults {
  userAgent: string;
  betaFeatures: string;
}

export interface ClaudeHeaderDefaults {
  userAgent: string;
  packageVersion: string;
  runtimeVersion: string;
  os: string;
  arch: string;
  timeout: string;
  stabilizeDeviceProfile?: boolean;
}

export interface XAIConfig {
  liveMediaRelay: {
    enabled: boolean;
    maxSessions: number;
    disablePrivateRemoteIPs: boolean;
    publicIP: string;
    udpPortMin: number;
    udpPortMax: number;
    iceServers: CodexLiveICEServer[];
  };
}

export interface CodexLiveICEServer {
  urls: string[];
  username: string;
  credential: string;
}

// Infrastructure Config Types
export interface TLSConfig {
  enable: boolean;
  cert: string;
  key: string;
}

export interface PprofConfig {
  enable: boolean;
  addr: string;
}

export interface MetricsConfig {
  enabled: boolean;
  path: string;
}

export interface LogsRotationConfig {
  maxSizeMB: number;
  maxAgeDays: number;
  maxBackups: number;
  compress: boolean;
}

export interface SemanticCacheConfig {
  enabled: boolean;
  similarityThreshold: number;
  maxEntries: number;
  ttl: string;
  embeddingModel: string;
  embeddingModelPath: string;
  tokenizerPath: string;
  cacheDir: string;
  onlyCache2xx: boolean;
  excludeReasoningModels: boolean;
}

export interface ModelCapabilityConfig {
  enabled: boolean;
  autoDiscover: boolean;
  persistToSQLite: boolean;
  cacheTTL: string;
  costRules: {
    enabled: boolean;
    monthlyBudgetUSD: number;
    rules: CostRule[];
  };
}

export interface CostRule {
  provider: string;
  model: string;
  inputPer1M: number;
  outputPer1M: number;
  cachedPer1M: number;
  tags: string[];
}

// Prompts Config Types
export interface PromptInjectConfig {
  system: string;
  systemMode: string;
  prependUser: string;
  appendUser: string;
}

export interface PromptInjectionConfig {
  models: PromptModelRule[];
  inject: PromptInjectConfig;
}

export interface PromptModelRule {
  name: string;
  protocol?: string;
  headers?: Record<string, string>;
  match?: Record<string, any>[];
  notMatch?: Record<string, any>[];
  exist?: string[];
  notExist?: string[];
}

export interface PromptsConfig {
  enabled?: boolean;
  default: PromptInjectConfig;
  presets: PromptInjectionConfig[];
}

// PromptNorm Config Types
export interface PromptNormConfig {
  enabled: boolean;
  maxContextTokens: number;
  preserveLastNBlocks: number;
  minDropTokens: number;
  maxDropRatio: number;
  truncateHeadKeep: number;
  truncateTailKeep: number;
  pruneToolResults: boolean;
  selectSystemPrompt: boolean;
  systemPromptMode: string;
  allowPrefixMutation: boolean;
  promptOverrides: Record<string, string>;
  debugLog: boolean;
}

// Advanced Config Types
export interface CredentialConcurrencyConfig {
  lifecycleConfigRevision: number;
  observationBarrierRevision: number;
  cpaHeartbeatTimeout: string;
  cpaCancelBound: string;
  reclaimGrace: string;
  cleanupInterval: string;
  releaseFlushInterval: string;
  releaseMaxBackoff: string;
  busyRetryMin: string;
  busyRetryMax: string;
  maxLimit: number;
}

export interface CredentialInFlightConfig {
  snapshotInterval: string;
  staleAfter: string;
  maxPartBytes: number;
  maxPartCount: number;
  maxRevisionBytes: number;
  maxAggregateGroups: number;
  maxDetails: number;
  maxStringBytes: number;
  stagingRetention: string;
}

export interface AIAgentConfig {
  enabled: boolean;
  mode: string;
  routingBackend: string;
  tiAgentURL: string;
  tiAgentTimeout: number;
  fallbackToStatic: boolean;
  cacheTTLSeconds: number;
  defaultProvider: string;
  costWeight: number;
  latencyWeight: number;
  qualityWeight: number;
}

// Simple Field Config Types (already in VisualConfigValues but need to add)
export type SimpleFieldConfig =
  | 'transientErrorCooldownSeconds'
  | 'authAutoRefreshWorkers'
  | 'tokenRotationEnabled'
  | 'tokenRotationRefreshBufferSeconds'
  | 'commercialMode'
  | 'antigravitySignatureCacheEnabled'
  | 'antigravitySignatureBypassStrict'
  | 'disableClaudeCloakMode';

export type VisualConfigValues = {
  host: string;
  port: string;
  tlsEnable: boolean;
  tlsCert: string;
  tlsKey: string;
  rmAllowRemote: boolean;
  rmSecretKey: string;
  rmDisableControlPanel: boolean;
  rmDisableAutoUpdatePanel: boolean;
  rmPanelRepo: string;
  authDir: string;
  apiKeysText: string;
  pluginsEnabled: boolean;
  pluginStoreSources: string[];
  pluginStoreAuth: PluginStoreAuthRule[];
  debug: boolean;
  commercialMode: boolean;
  loggingToFile: boolean;
  logsMaxTotalSizeMb: string;
  errorLogsMaxFiles: string;
  usageStatisticsEnabled: boolean;
  redisUsageQueueRetentionSeconds: string;
  proxyUrl: string;
  forceModelPrefix: boolean;
  passthroughHeaders: boolean;
  requestRetry: string;
  maxRetryCredentials: string;
  maxRetryInterval: string;
  disableCooling: boolean;
  disableImageGeneration: DisableImageGenerationMode;
  gptImage2BaseModel: string;
  authAutoRefreshWorkers: string;
  quotaSwitchProject: boolean;
  quotaSwitchPreviewModel: boolean;
  quotaAntigravityCredits: boolean;
  routingStrategy: RoutingStrategy;
  routingSessionAffinity: boolean;
  routingSessionAffinityTTL: string;
  wsAuth: boolean;
  antigravitySignatureCacheEnabled: boolean;
  antigravitySignatureBypassStrict: boolean;
  claudeHeaderUserAgent: string;
  claudeHeaderPackageVersion: string;
  claudeHeaderRuntimeVersion: string;
  claudeHeaderOs: string;
  claudeHeaderArch: string;
  claudeHeaderTimeout: string;
  claudeHeaderStabilizeDeviceProfile: boolean;
  codexHeaderUserAgent: string;
  codexHeaderBetaFeatures: string;
  payloadDefaultRules: PayloadRule[];
  payloadDefaultRawRules: PayloadRule[];
  payloadOverrideRules: PayloadRule[];
  payloadOverrideRawRules: PayloadRule[];
  payloadFilterRules: PayloadFilterRule[];
  streaming: StreamingConfig;
  rtk: RTKConfig;
  caveman: CavemanConfig;
  // LLM Features
  intelligentRouting: IntelligentRoutingConfig;
  llmRouting: LLMRoutingConfig;
  llmDiagnostics: LLMDiagnosticsConfig;
  llmFixSuggester: LLMFixSuggesterConfig;
  llmHealthQuery: LLMHealthQueryConfig;
  llmClient: LLMClientConfig;
  // Routing Extended
  routingHealthCheck: HealthCheckConfig;
  routingCircuitBreaker: CircuitBreakerConfig;
  routingFallback: FallbackRoutingConfig;
  routingChains: Record<string, PriorityChain>;
  routingPriorityFailover: PriorityFailoverConfig;
  // Quota Extended
  quota: QuotaConfig;
  // Protocol Configs
  codexHeaderDefaults: CodexHeaderDefaults;
  claudeHeaderDefaults: ClaudeHeaderDefaults;
  xai: XAIConfig;
  // Infrastructure
  tls: TLSConfig;
  pprof: PprofConfig;
  metrics: MetricsConfig;
  logsRotation: LogsRotationConfig;
  semanticCache: SemanticCacheConfig;
  modelCapabilities: ModelCapabilityConfig;
  // Advanced
  credentialConcurrency: CredentialConcurrencyConfig;
  credentialInFlight: CredentialInFlightConfig;
  aiAgent: AIAgentConfig;
  // Missing sections
  prompts: PromptsConfig;
  promptNorm: PromptNormConfig;
  // Simple fields (fields not already defined above)
  transientErrorCooldownSeconds: number;
  tokenRotationEnabled: boolean;
  tokenRotationRefreshBufferSeconds: number;
  disableClaudeCloakMode: boolean;
  // Advanced section fields
  antigravitySensitiveWords: string[];
  devinSensitiveWords: string[];
  // Note: commercialMode, authAutoRefreshWorkers, antigravitySignatureCacheEnabled, antigravitySignatureBypassStrict
  // are already defined above in the main interface body
};

export const makeClientId = () => {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

export const DEFAULT_VISUAL_VALUES: VisualConfigValues = {
  host: '',
  port: '',
  tlsEnable: false,
  tlsCert: '',
  tlsKey: '',
  rmAllowRemote: false,
  rmSecretKey: '',
  rmDisableControlPanel: false,
  rmDisableAutoUpdatePanel: false,
  rmPanelRepo: '',
  authDir: '',
  apiKeysText: '',
  pluginsEnabled: false,
  pluginStoreSources: [],
  pluginStoreAuth: [],
  debug: false,
  commercialMode: false,
  loggingToFile: false,
  logsMaxTotalSizeMb: '',
  errorLogsMaxFiles: '',
  usageStatisticsEnabled: false,
  redisUsageQueueRetentionSeconds: '',
  proxyUrl: '',
  forceModelPrefix: false,
  passthroughHeaders: false,
  requestRetry: '',
  maxRetryCredentials: '',
  maxRetryInterval: '',
  disableCooling: false,
  disableImageGeneration: 'false',
  gptImage2BaseModel: '',
  authAutoRefreshWorkers: '',
  quotaSwitchProject: false,
  quotaSwitchPreviewModel: false,
  quotaAntigravityCredits: false,
  routingStrategy: 'round-robin',
  routingSessionAffinity: false,
  routingSessionAffinityTTL: '',
  wsAuth: true,
  antigravitySignatureCacheEnabled: true,
  antigravitySignatureBypassStrict: false,
  claudeHeaderUserAgent: '',
  claudeHeaderPackageVersion: '',
  claudeHeaderRuntimeVersion: '',
  claudeHeaderOs: '',
  claudeHeaderArch: '',
  claudeHeaderTimeout: '',
  claudeHeaderStabilizeDeviceProfile: false,
  codexHeaderUserAgent: '',
  codexHeaderBetaFeatures: '',
  payloadDefaultRules: [],
  payloadDefaultRawRules: [],
  payloadOverrideRules: [],
  payloadOverrideRawRules: [],
  payloadFilterRules: [],
  streaming: {
    keepaliveSeconds: '',
    bootstrapRetries: '',
    nonstreamKeepaliveInterval: '',
  },
  rtk: {
    enabled: false,
    binary: '',
    ultraMode: false,
    poolSize: '',
    timeout: '',
  },
  caveman: {
    enabled: false,
    level: 'full',
    cacheSize: '',
    threshold: 0,
  },
  // LLM Features
  intelligentRouting: {
    enabled: false,
    mode: 'local',
    triggerModels: ['auto', 'tirouter/auto', 'tirouter-auto', '@auto'],
    preferredProviders: [],
    defaultBudget: 'balanced',
    confidenceThreshold: 0.7,
    decisionCacheTTL: '10m',
    modelAliases: [],
  },
  llmRouting: {
    enabled: false,
    llmProvider: 'openrouter',
    llmModel: 'google/gemini-2.5-flash',
    cacheTTLSeconds: 120,
    fallbackToStatic: true,
    timeoutSeconds: 2,
    costWeight: 0.3,
    latencyWeight: 0.3,
    qualityWeight: 0.4,
    analysisCompression: {
      enabled: false,
      stripNoise: false,
      compressRepeats: false,
      maxPromptChars: 0,
    },
  },
  llmDiagnostics: {
    enabled: false,
    modelHint: 'gpt-4o-mini',
    providerHint: 'openrouter',
    errorDiagnosis: {
      enabled: false,
      captureStackTrace: true,
      logContextLines: 50,
      minSeverity: 'medium',
      cooldown: '1h',
    },
    logAnalysis: {
      enabled: false,
      interval: '5m',
      windowSize: '5m',
      maxEntries: 100,
      minSeverity: 'warn',
      alertOnAnomaly: false,
    },
  },
  llmFixSuggester: {
    enabled: false,
    recurrenceThreshold: 3,
    timeWindowHours: 24,
    modelHint: 'gpt-4o-mini',
    providerHint: 'openrouter',
  },
  llmHealthQuery: {
    enabled: false,
    modelHint: 'gpt-4o-mini',
    providerHint: 'openai',
    timeoutSeconds: 5,
  },
  llmClient: {
    cacheEnabled: true,
    cacheTTL: '5m',
    cacheMaxItems: 1000,
    modelHints: {
      analysis: 'gpt-4o-mini',
      routing: 'gpt-4o-mini',
      diagnostics: 'gpt-4o-mini',
      config_gen: 'gpt-4o-mini',
      health_query: 'gpt-4o-mini',
      fix_suggestion: 'gpt-4o-mini',
    },
  },
  // Routing Extended
  routingHealthCheck: {
    enabled: true,
    interval: '30s',
    timeout: '5s',
    failureThreshold: 3,
    successThreshold: 2,
  },
  routingCircuitBreaker: {
    enabled: true,
    failureThreshold: 5,
    successThreshold: 2,
    timeout: '60s',
  },
  routingFallback: {
    enabled: false,
    persistToSQLite: false,
    defaultChains: {},
  },
  routingChains: {},
  routingPriorityFailover: {
    enabled: false,
    defaultChain: '',
    healthCheckInterval: '',
    enableManagementAPI: false,
  },
  // Quota Extended
  quota: {
    enabled: true,
    dailyLimit: 0,
    tokenLimit: 0,
    storeDir: '',
    cache: {
      activeTTL: '5m',
      exhaustedTTL: '5m',
      refreshInterval: '1m',
      maxConcurrentRefreshes: 10,
      persistToSQLite: true,
    },
    antigravity: {
      familyWindows: true,
    },
    codex: {
      sessionScope: true,
      weeklyScope: true,
    },
  },
  // Protocol Configs
  codexHeaderDefaults: {
    userAgent: '',
    betaFeatures: '',
  },
  claudeHeaderDefaults: {
    userAgent: '',
    packageVersion: '',
    runtimeVersion: '',
    os: '',
    arch: '',
    timeout: '',
    stabilizeDeviceProfile: false,
  },
  xai: {
    liveMediaRelay: {
      enabled: false,
      maxSessions: 0,
      disablePrivateRemoteIPs: false,
      publicIP: '',
      udpPortMin: 0,
      udpPortMax: 0,
      iceServers: [],
    },
  },
  // Infrastructure
  tls: {
    enable: false,
    cert: '',
    key: '',
  },
  pprof: {
    enable: false,
    addr: '',
  },
  metrics: {
    enabled: false,
    path: '/metrics',
  },
  logsRotation: {
    maxSizeMB: 0,
    maxAgeDays: 0,
    maxBackups: 0,
    compress: false,
  },
  semanticCache: {
    enabled: false,
    similarityThreshold: 0.85,
    maxEntries: 10000,
    ttl: '24h',
    embeddingModel: 'bge-small-en-v1.5',
    embeddingModelPath: '',
    tokenizerPath: '',
    cacheDir: '',
    onlyCache2xx: true,
    excludeReasoningModels: true,
  },
  modelCapabilities: {
    enabled: false,
    autoDiscover: false,
    persistToSQLite: false,
    cacheTTL: '',
    costRules: {
      enabled: false,
      monthlyBudgetUSD: 0,
      rules: [],
    },
  },
  // Advanced
  credentialConcurrency: {
    lifecycleConfigRevision: 0,
    observationBarrierRevision: 0,
    cpaHeartbeatTimeout: '3s',
    cpaCancelBound: '5s',
    reclaimGrace: '5s',
    cleanupInterval: '5s',
    releaseFlushInterval: '250ms',
    releaseMaxBackoff: '2s',
    busyRetryMin: '250ms',
    busyRetryMax: '1s',
    maxLimit: 1000000,
  },
  credentialInFlight: {
    snapshotInterval: '2s',
    staleAfter: '10s',
    maxPartBytes: 262144,
    maxPartCount: 64,
    maxRevisionBytes: 16777216,
    maxAggregateGroups: 100000,
    maxDetails: 10000,
    maxStringBytes: 256,
    stagingRetention: '1m',
  },
  aiAgent: {
    enabled: false,
    mode: 'integrated',
    routingBackend: 'tiagent',
    tiAgentURL: '',
    tiAgentTimeout: 30,
    fallbackToStatic: true,
    cacheTTLSeconds: 120,
    defaultProvider: '',
    costWeight: 0.3,
    latencyWeight: 0.3,
    qualityWeight: 0.4,
  },
  // Missing sections
  prompts: {
    enabled: false,
    default: {
      system: '',
      systemMode: 'merge',
      prependUser: '',
      appendUser: '',
    },
    presets: [],
  },
  promptNorm: {
    enabled: false,
    maxContextTokens: 0,
    preserveLastNBlocks: 0,
    minDropTokens: 0,
    maxDropRatio: 0,
    truncateHeadKeep: 0,
    truncateTailKeep: 0,
    pruneToolResults: false,
    selectSystemPrompt: false,
    systemPromptMode: 'off',
    allowPrefixMutation: false,
    promptOverrides: {},
    debugLog: false,
  },
  // Advanced section fields
  antigravitySensitiveWords: [],
  devinSensitiveWords: [],
  // Missing simple fields
  transientErrorCooldownSeconds: 0,
  tokenRotationEnabled: false,
  tokenRotationRefreshBufferSeconds: 0,
  disableClaudeCloakMode: false,
};
