import type { Config, OpenAIProviderConfig } from '@/types';
import type { SponsorProviderRaw } from './types';

export const OPENROUTER_PROVIDER_NAME = 'openrouter';
export const OPENROUTER_DISPLAY_NAME = 'OpenRouter';
export const OPENROUTER_AFFILIATE_URL = 'https://openrouter.ai/';
export const OPENROUTER_BASE_URL = 'https://openrouter.ai';
export const OPENROUTER_OPENAI_BASE_URL = `${OPENROUTER_BASE_URL}/api/v1`;

export const OPENROUTER_BASE_URL_OPTIONS = [
  {
    id: 'standard',
    baseUrl: OPENROUTER_BASE_URL,
    openaiBaseUrl: OPENROUTER_OPENAI_BASE_URL,
    codexBaseUrl: OPENROUTER_OPENAI_BASE_URL,
    anthropicBaseUrl: OPENROUTER_OPENAI_BASE_URL,
    geminiBaseUrl: OPENROUTER_OPENAI_BASE_URL,
  },
] as const;

const normalizeText = (value: string | undefined | null): string =>
  String(value ?? '')
    .trim()
    .toLowerCase();

const normalizeBaseUrl = (value: string | undefined | null): string =>
  normalizeText(value).replace(/\/+$/, '');

export const resolveOpenRouterBaseUrl = (value: string | undefined | null): string => {
  const normalized = normalizeBaseUrl(value);
  const matched = OPENROUTER_BASE_URL_OPTIONS.find(
    (option) =>
      normalized === normalizeBaseUrl(option.baseUrl) ||
      normalized === normalizeBaseUrl(option.openaiBaseUrl)
  );
  return matched?.baseUrl ?? OPENROUTER_BASE_URL;
};

export const getOpenRouterProtocolUrls = (value: string | undefined | null) => {
  const baseUrl = resolveOpenRouterBaseUrl(value);
  const matched =
    OPENROUTER_BASE_URL_OPTIONS.find(
      (option) => normalizeBaseUrl(option.baseUrl) === normalizeBaseUrl(baseUrl)
    ) ?? OPENROUTER_BASE_URL_OPTIONS[0];
  return {
    openai: matched.openaiBaseUrl,
    anthropic: matched.openaiBaseUrl, // OpenRouter uses OpenAI-compatible format for all
    codex: matched.openaiBaseUrl,
    gemini: matched.openaiBaseUrl,
  };
};

const matchesOpenRouterOpenAIBaseUrl = (value: string | undefined | null): boolean => {
  const normalized = normalizeBaseUrl(value);
  return OPENROUTER_BASE_URL_OPTIONS.some(
    (option) =>
      normalized === normalizeBaseUrl(option.openaiBaseUrl)
  );
};

export const isOpenRouterOpenAIProvider = (
  config: OpenAIProviderConfig | undefined | null
): boolean => {
  if (!config) return false;
  return matchesOpenRouterOpenAIBaseUrl(config.baseUrl);
};

export const buildOpenRouterRaw = (config: Config | null | undefined): SponsorProviderRaw => ({
  openai: (config?.openaiCompatibility ?? [])
    .map((item, index) => ({ config: item, index: item.sourceIndex ?? index }))
    .filter((item) => isOpenRouterOpenAIProvider(item.config)),
  claude: [],
  codex: [],
  gemini: [],
  anthropic: [],
});

export const hasOpenRouterConfig = (config: Config | null | undefined): boolean => {
  const raw = buildOpenRouterRaw(config);
  return raw.openai.length > 0;
};