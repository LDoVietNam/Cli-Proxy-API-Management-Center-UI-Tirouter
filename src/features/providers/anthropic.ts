import type { Config, ProviderKeyConfig } from '@/types';
import type { SponsorProviderRaw } from './types';

export const ANTHROPIC_PROVIDER_NAME = 'anthropic';
export const ANTHROPIC_DISPLAY_NAME = 'Anthropic';
export const ANTHROPIC_AFFILIATE_URL = 'https://console.anthropic.com/';
export const ANTHROPIC_BASE_URL = 'https://api.anthropic.com';
export const ANTHROPIC_MESSAGES_BASE_URL = `${ANTHROPIC_BASE_URL}/v1/messages`;
export const ANTHROPIC_LEGACY_BASE_URL = 'https://api.anthropic.com';

export const ANTHROPIC_BASE_URL_OPTIONS = [
  {
    id: 'standard',
    baseUrl: ANTHROPIC_BASE_URL,
    openaiBaseUrl: '',
    anthropicBaseUrl: ANTHROPIC_MESSAGES_BASE_URL,
    codexBaseUrl: '',
    geminiBaseUrl: '',
  },
] as const;

export const ANTHROPIC_PROTOCOL_LABELS = ['anthropic'] as const;

const normalizeText = (value: string | undefined | null): string =>
  String(value ?? '')
    .trim()
    .toLowerCase();

const normalizeBaseUrl = (value: string | undefined | null): string =>
  normalizeText(value).replace(/\/+$/, '');

export const resolveAnthropicBaseUrl = (value: string | undefined | null): string => {
  const normalized = normalizeBaseUrl(value);
  const matched = ANTHROPIC_BASE_URL_OPTIONS.find(
    (option) =>
      normalized === normalizeBaseUrl(option.baseUrl) ||
      normalized === normalizeBaseUrl(option.anthropicBaseUrl)
  );
  return matched?.baseUrl ?? ANTHROPIC_BASE_URL;
};

export const getAnthropicProtocolUrls = (value: string | undefined | null) => {
  const baseUrl = resolveAnthropicBaseUrl(value);
  const matched =
    ANTHROPIC_BASE_URL_OPTIONS.find(
      (option) => normalizeBaseUrl(option.baseUrl) === normalizeBaseUrl(baseUrl)
    ) ?? ANTHROPIC_BASE_URL_OPTIONS[0];
  return {
    anthropic: matched.anthropicBaseUrl,
    openai: '',
    codex: '',
    gemini: '',
  };
};

const matchesAnthropicAnthropicBaseUrl = (value: string | undefined | null): boolean => {
  const normalized = normalizeBaseUrl(value);
  return ANTHROPIC_BASE_URL_OPTIONS.some(
    (option) => normalized === normalizeBaseUrl(option.anthropicBaseUrl)
  );
};

export const isAnthropicClaudeProvider = (
  config: ProviderKeyConfig | undefined | null
): boolean => {
  if (!config) return false;
  return matchesAnthropicAnthropicBaseUrl(config.baseUrl);
};

export const buildAnthropicRaw = (config: Config | null | undefined): SponsorProviderRaw => ({
  openai: [],
  claude: (config?.claudeApiKeys ?? [])
    .map((item, index) => ({ config: item, index }))
    .filter((item) => isAnthropicClaudeProvider(item.config)),
  codex: [],
  gemini: [],
  anthropic: (config?.claudeApiKeys ?? [])
    .map((item, index) => ({ config: item, index }))
    .filter((item) => isAnthropicClaudeProvider(item.config)),
});

export const hasAnthropicConfig = (config: Config | null | undefined): boolean => {
  const raw = buildAnthropicRaw(config);
  return raw.anthropic.length > 0;
};

export interface AnthropicCostEstimate {
  model: string;
  inputCostPer1k: number;
  outputCostPer1k: number;
  currency: 'USD';
}

export const ANTHROPIC_COST_ESTIMATES: AnthropicCostEstimate[] = [
  { model: 'claude-3-5-sonnet-20241022', inputCostPer1k: 3.00, outputCostPer1k: 15.00, currency: 'USD' },
  { model: 'claude-3-5-haiku-20241022', inputCostPer1k: 0.25, outputCostPer1k: 1.25, currency: 'USD' },
  { model: 'claude-3-opus-20240229', inputCostPer1k: 15.00, outputCostPer1k: 75.00, currency: 'USD' },
  { model: 'claude-3-sonnet-20240229', inputCostPer1k: 3.00, outputCostPer1k: 15.00, currency: 'USD' },
  { model: 'claude-3-haiku-20240307', inputCostPer1k: 0.25, outputCostPer1k: 1.25, currency: 'USD' },
];

export const getAnthropicCostEstimate = (model: string): AnthropicCostEstimate | undefined => {
  const normalized = model.toLowerCase().replace(/^claude\//, '');
  return ANTHROPIC_COST_ESTIMATES.find((e) => e.model.toLowerCase() === normalized);
};

export interface AnthropicCapabilities {
  streaming: boolean;
  toolCalling: boolean;
  vision: boolean;
  jsonMode: boolean;
  maxTokens: number;
  contextWindow: number;
}

export const ANTHROPIC_CAPABILITIES: Record<string, AnthropicCapabilities> = {
  'claude-3-5-sonnet-20241022': {
    streaming: true,
    toolCalling: true,
    vision: true,
    jsonMode: true,
    maxTokens: 8192,
    contextWindow: 200000,
  },
  'claude-3-5-haiku-20241022': {
    streaming: true,
    toolCalling: true,
    vision: true,
    jsonMode: true,
    maxTokens: 8192,
    contextWindow: 200000,
  },
  'claude-3-opus-20240229': {
    streaming: true,
    toolCalling: true,
    vision: true,
    jsonMode: true,
    maxTokens: 4096,
    contextWindow: 200000,
  },
  'claude-3-sonnet-20240229': {
    streaming: true,
    toolCalling: true,
    vision: true,
    jsonMode: true,
    maxTokens: 4096,
    contextWindow: 200000,
  },
  'claude-3-haiku-20240307': {
    streaming: true,
    toolCalling: true,
    vision: true,
    jsonMode: true,
    maxTokens: 4096,
    contextWindow: 200000,
  },
};

export const getAnthropicCapabilities = (model: string): AnthropicCapabilities | undefined => {
  const normalized = model.toLowerCase().replace(/^claude\//, '');
  return ANTHROPIC_CAPABILITIES[normalized];
};

export const ANTHROPIC_HEALTH_CHECK_ENDPOINT = '/v1/messages';

export const buildAnthropicHealthCheckUrl = (baseUrl: string): string => {
  const normalized = baseUrl.replace(/\/+$/, '');
  if (normalized.endsWith('/v1/messages') || normalized.endsWith('/v1')) {
    return `${normalized}/health`; // Anthropic doesn't have a standard health endpoint, using models list as proxy
  }
  return `${normalized}/v1/messages`;
};

export interface AnthropicHealthCheckResult {
  healthy: boolean;
  latencyMs: number;
  statusCode: number;
  error?: string;
  timestamp: string;
}

export const checkAnthropicHealth = async (
  baseUrl: string,
  apiKey: string,
  timeoutMs: number = 5000
): Promise<AnthropicHealthCheckResult> => {
  const start = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Anthropic doesn't have a standard health endpoint
    // We use a minimal messages request as a health check
    const url = buildAnthropicHealthCheckUrl(baseUrl);
    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'hi' }],
      }),
    });

    const latencyMs = Date.now() - start;
    clearTimeout(timeoutId);

    if (response.ok || response.status === 400) {
      // 400 is expected for invalid request but means auth worked
      return {
        healthy: true,
        latencyMs,
        statusCode: response.status,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      healthy: false,
      latencyMs,
      statusCode: response.status,
      error: `HTTP ${response.status}: ${response.statusText}`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    clearTimeout(timeoutId);

    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        healthy: false,
        latencyMs: timeoutMs,
        statusCode: 0,
        error: 'Request timeout',
        timestamp: new Date().toISOString(),
      };
    }

    return {
      healthy: false,
      latencyMs,
      statusCode: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
};

export const ANTHROPIC_DEFAULT_MODELS = [
  'claude-3-5-sonnet-20241022',
  'claude-3-5-haiku-20241022',
  'claude-3-opus-20240229',
  'claude-3-sonnet-20240229',
  'claude-3-haiku-20240307',
] as const;