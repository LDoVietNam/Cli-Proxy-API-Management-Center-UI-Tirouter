/**
 * TiRouter-specific types for CLI Providers, Compression, RTK, Prompts, Routing Test
 */

// CLI Provider types
export interface CLIProviderStatus {
  provider: string;
  enabled: boolean;
  binary?: string;
  binary_exists?: boolean;
  executable?: boolean;
  config_dir?: string;
  auth_mode?: string;
  // Freebuff-specific fields (HTTP-based provider; the binary is never spawned
  // for inference, so status reports the credential/account setup instead).
  auth_resolved?: boolean;
  account_count?: number;
  accounts?: string[];
  default_model?: string;
  routing?: string;
  base_url?: string;
}

export interface CLIProvidersListResponse {
  providers: Array<{ name: string; enabled: boolean }>;
}

export interface CLIProviderConfig {
  enabled: boolean;
  binary: string;
  'auth-mode': string;
  env?: string[];
  model?: string;
  alias?: string;
  args?: string;
}

// Compression (Caveman) types
export interface CavemanConfig {
  enabled: boolean;
  level: string;
}

export interface CavemanStats {
  enabled: boolean;
  level: string;
  savings: CavemanSavings;
}

export interface CavemanSavings {
  total_requests?: number;
  total_input_chars?: number;
  total_output_chars?: number;
  total_savings_percent?: number;
  by_level?: Record<string, { input: number; output: number; savings: number }>;
}

// RTK types
export interface RTKConfig {
  enabled: boolean;
  binary: string;
  'ultra-mode': boolean;
  'pool-size'?: string;
  timeout?: string;
}

export interface RTKStats {
  enabled: boolean;
  stats: RTKStatEntry[];
}

export interface RTKStatEntry {
  name: string;
  count: number;
  total_time_ms: number;
  avg_time_ms: number;
  min_time_ms: number;
  max_time_ms: number;
}

export interface CompressionStatsResponse {
  caveman: CavemanStats;
  rtk: RTKStats;
}

// Prompts types
export interface PromptInject {
  system?: string;
  'system-mode'?: string;
  'prepend-user'?: string;
  'append-user'?: string;
}

export interface PromptMatch {
  [key: string]: any;
}

/**
 * One model entry of a preset. The backend models this as an object
 * (config.PromptModelRule): the pattern lives in `name`, and the match
 * conditions belong to the rule, not to the preset.
 */
export interface PromptModelRule {
  name: string;
  protocol?: string;
  'from-protocol'?: string;
  headers?: Record<string, string>;
  match?: PromptMatch[];
  'not-match'?: PromptMatch[];
  exist?: string[];
  'not-exist'?: string[];
}

export interface PromptPreset {
  name: string;
  priority?: number;
  models: PromptModelRule[];
  inject: PromptInject;
}

export interface PromptsConfig {
  enabled: boolean;
  presets: PromptPreset[];
  default: PromptInject;
}