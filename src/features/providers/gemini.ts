import type { Config, OpenAIProviderConfig, ProviderKeyConfig, GeminiKeyConfig } from '@/types';
import type { SponsorProviderRaw } from './types';

export const GEMINI_PROVIDER_NAME = 'gemini';
export const GEMINI_DISPLAY_NAME = 'Gemini';
export const GEMINI_DEFAULT_BASE_URL = 'https://generativelanguage.googleapis.com';
export const GEMINI_API_BASE_URL = `${GEMINI_DEFAULT_BASE_URL}/v1beta`;
export const GEMINI_OPENAI_BASE_URL = `${GEMINI_DEFAULT_BASE_URL}/v1beta/openai`;
export const GEMINI_AFFILIATE_URL = 'https://ai.google.dev/gemini-api/docs/api-key';

export const GEMINI_BASE_URL_OPTIONS = [
  {
    id: 'default',
    descriptionKey: 'default',
    baseUrl: GEMINI_DEFAULT_BASE_URL,
    openaiBaseUrl: GEMINI_OPENAI_BASE_URL,
    geminiBaseUrl: GEMINI_API_BASE_URL,
    anthropicBaseUrl: '',
    codexBaseUrl: '',
  },
] as const;

export const GEMINI_PROTOCOL_LABELS = ['gemini', 'openai'] as const;

export const getGeminiAffiliateUrl = (): string =>
  GEMINI_AFFILIATE_URL;

const normalizeText = (value: string | undefined | null): string =>
  String(value ?? '')
    .trim()
    .toLowerCase();

const normalizeBaseUrl = (value: string | undefined | null): string =>
  normalizeText(value).replace(/\/+$/, '');

export const resolveGeminiBaseUrl = (value: string | undefined | null): string => {
  const normalized = normalizeBaseUrl(value);
  const matched = GEMINI_BASE_URL_OPTIONS.find(
    (option) =>
      normalized === normalizeBaseUrl(option.baseUrl) ||
      normalized === normalizeBaseUrl(option.openaiBaseUrl) ||
      normalized === normalizeBaseUrl(option.geminiBaseUrl)
  );
  if (matched) return matched.baseUrl;
  return GEMINI_DEFAULT_BASE_URL;
};

export const getGeminiProtocolUrls = (value: string | undefined | null) => {
  const baseUrl = resolveGeminiBaseUrl(value);
  const matched =
    GEMINI_BASE_URL_OPTIONS.find(
      (option) => normalizeBaseUrl(option.baseUrl) === normalizeBaseUrl(baseUrl)
    ) ?? GEMINI_BASE_URL_OPTIONS[0];
  return {
    anthropic: '',
    openai: matched.openaiBaseUrl,
    codex: '',
    gemini: matched.geminiBaseUrl,
  };
};

export const isGeminiOpenAIProvider = (config: OpenAIProviderConfig | undefined | null): boolean => {
  if (!config) return false;
  const baseUrl = normalizeBaseUrl(config.baseUrl);
  return (
    GEMINI_BASE_URL_OPTIONS.some((option) => baseUrl === normalizeBaseUrl(option.openaiBaseUrl)) ||
    baseUrl === normalizeBaseUrl(GEMINI_API_BASE_URL) ||
    baseUrl === normalizeBaseUrl(GEMINI_OPENAI_BASE_URL) ||
    baseUrl === normalizeBaseUrl(GEMINI_DEFAULT_BASE_URL)
  );
};

export const isGeminiKeyProvider = (config: ProviderKeyConfig | undefined | null): boolean => {
  if (!config) return false;
  const baseUrl = normalizeBaseUrl(config.baseUrl);
  return (
    GEMINI_BASE_URL_OPTIONS.some((option) => baseUrl === normalizeBaseUrl(option.geminiBaseUrl)) ||
    baseUrl === normalizeBaseUrl(GEMINI_API_BASE_URL) ||
    baseUrl === normalizeBaseUrl(GEMINI_DEFAULT_BASE_URL)
  );
};

export const isGeminiConfig = (config: GeminiKeyConfig | undefined | null): boolean => {
  if (!config) return false;
  const baseUrl = normalizeBaseUrl(config.baseUrl);
  return (
    GEMINI_BASE_URL_OPTIONS.some((option) => baseUrl === normalizeBaseUrl(option.geminiBaseUrl)) ||
    baseUrl === normalizeBaseUrl(GEMINI_API_BASE_URL) ||
    baseUrl === normalizeBaseUrl(GEMINI_DEFAULT_BASE_URL) ||
    baseUrl === ''
  );
};

export const buildGeminiRaw = (config: Config | null | undefined): SponsorProviderRaw => ({
  openai: (config?.openaiCompatibility ?? [])
    .map((item: OpenAIProviderConfig, index: number) => ({ config: item, index: item.sourceIndex ?? index }))
    .filter((item) => isGeminiOpenAIProvider(item.config)),
  claude: (config?.claudeApiKeys ?? [])
    .map((item: ProviderKeyConfig, index: number) => ({ config: item, index }))
    .filter((item) => isGeminiKeyProvider(item.config)),
  codex: [],
  gemini: (config?.geminiApiKeys ?? [])
    .map((item: GeminiKeyConfig, index: number) => ({ config: item, index }))
    .filter((item) => isGeminiConfig(item.config)),
  anthropic: [],
});

export const hasGeminiConfig = (config: Config | null | undefined): boolean => {
  const raw = buildGeminiRaw(config);
  return raw.openai.length > 0 || raw.claude.length > 0 || raw.gemini.length > 0;
};

export interface GeminiCostEstimate {
  model: string;
  inputCostPer1k: number;
  outputCostPer1k: number;
  currency: 'USD';
}

export const GEMINI_COST_ESTIMATES: GeminiCostEstimate[] = [
  { model: 'gemini-2.5-flash', inputCostPer1k: 0.075, outputCostPer1k: 0.30, currency: 'USD' },
  { model: 'gemini-2.5-pro', inputCostPer1k: 1.25, outputCostPer1k: 5.00, currency: 'USD' },
  { model: 'gemini-2.0-flash', inputCostPer1k: 0.075, outputCostPer1k: 0.30, currency: 'USD' },
  { model: 'gemini-2.0-flash-lite', inputCostPer1k: 0.0375, outputCostPer1k: 0.15, currency: 'USD' },
  { model: 'gemini-1.5-flash', inputCostPer1k: 0.075, outputCostPer1k: 0.30, currency: 'USD' },
  { model: 'gemini-1.5-pro', inputCostPer1k: 1.25, outputCostPer1k: 5.00, currency: 'USD' },
  { model: 'gemini-1.5-flash-8b', inputCostPer1k: 0.0375, outputCostPer1k: 0.15, currency: 'USD' },
];

export const getGeminiCostEstimate = (model: string): GeminiCostEstimate | undefined => {
  const normalized = model.toLowerCase().replace(/^gemini\//, '');
  return GEMINI_COST_ESTIMATES.find((e) => e.model.toLowerCase() === normalized);
};

export interface GeminiCapabilities {
  streaming: boolean;
  toolCalling: boolean;
  vision: boolean;
  audio: boolean;
  jsonMode: boolean;
  maxTokens: number;
  contextWindow: number;
}

export const GEMINI_CAPABILITIES: Record<string, GeminiCapabilities> = {
  'gemini-2.5-flash': {
    streaming: true,
    toolCalling: true,
    vision: true,
    audio: true,
    jsonMode: true,
    maxTokens: 8192,
    contextWindow: 1048576,
  },
  'gemini-2.5-pro': {
    streaming: true,
    toolCalling: true,
    vision: true,
    audio: true,
    jsonMode: true,
    maxTokens: 8192,
    contextWindow: 2097152,
  },
  'gemini-2.0-flash': {
    streaming: true,
    toolCalling: true,
    vision: true,
    audio: true,
    jsonMode: true,
    maxTokens: 8192,
    contextWindow: 1048576,
  },
  'gemini-2.0-flash-lite': {
    streaming: true,
    toolCalling: true,
    vision: true,
    audio: false,
    jsonMode: true,
    maxTokens: 8192,
    contextWindow: 1048576,
  },
  'gemini-1.5-flash': {
    streaming: true,
    toolCalling: true,
    vision: true,
    audio: true,
    jsonMode: true,
    maxTokens: 8192,
    contextWindow: 1048576,
  },
  'gemini-1.5-pro': {
    streaming: true,
    toolCalling: true,
    vision: true,
    audio: true,
    jsonMode: true,
    maxTokens: 8192,
    contextWindow: 2097152,
  },
  'gemini-1.5-flash-8b': {
    streaming: true,
    toolCalling: true,
    vision: true,
    audio: false,
    jsonMode: true,
    maxTokens: 8192,
    contextWindow: 1048576,
  },
};

export const getGeminiCapabilities = (model: string): GeminiCapabilities | undefined => {
  const normalized = model.toLowerCase().replace(/^gemini\//, '');
  return GEMINI_CAPABILITIES[normalized];
};

export const GEMINI_HEALTH_CHECK_ENDPOINT = '/v1beta/models';

export const buildGeminiHealthCheckUrl = (baseUrl: string, apiKey: string): string => {
  const normalized = baseUrl.replace(/\/+$/, '');
  if (normalized.endsWith('/v1beta') || normalized.endsWith('/v1beta/openai')) {
    return `${normalized}/models?key=${apiKey}`;
  }
  return `${normalized}/v1beta/models?key=${apiKey}`;
};

export interface GeminiHealthCheckResult {
  healthy: boolean;
  latencyMs: number;
  statusCode: number;
  error?: string;
  models?: string[];
  timestamp: string;
}

export const checkGeminiHealth = async (
  baseUrl: string,
  apiKey: string,
  timeoutMs: number = 5000
): Promise<GeminiHealthCheckResult> => {
  const start = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = buildGeminiHealthCheckUrl(baseUrl, apiKey);
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const latencyMs = Date.now() - start;
    clearTimeout(timeoutId);

    if (response.ok) {
      const data: unknown = await response.json().catch(() => ({}));
      const models = ((data as { models?: Array<{ name?: string }> })?.models ?? [])
        .map((m) => m.name?.replace('models/', ''))
        .filter((name): name is string => Boolean(name));
      return {
        healthy: true,
        latencyMs,
        statusCode: response.status,
        models,
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

export const GEMINI_DEFAULT_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-1.5-flash-8b',
] as const;