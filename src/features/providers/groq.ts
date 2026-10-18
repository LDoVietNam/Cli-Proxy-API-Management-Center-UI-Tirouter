import type { Config, OpenAIProviderConfig } from '@/types';
import type { SponsorProviderRaw } from './types';

export const GROQ_PROVIDER_NAME = 'groq';
export const GROQ_DISPLAY_NAME = 'Groq';
export const GROQ_AFFILIATE_URL = 'https://groq.com/';
export const GROQ_BASE_URL = 'https://api.groq.com';
export const GROQ_OPENAI_BASE_URL = `${GROQ_BASE_URL}/openai/v1`;

export const GROQ_BASE_URL_OPTIONS = [
  {
    id: 'standard',
    baseUrl: GROQ_BASE_URL,
    openaiBaseUrl: GROQ_OPENAI_BASE_URL,
    codexBaseUrl: GROQ_OPENAI_BASE_URL,
    anthropicBaseUrl: GROQ_OPENAI_BASE_URL,
    geminiBaseUrl: GROQ_OPENAI_BASE_URL,
  },
] as const;

const normalizeText = (value: string | undefined | null): string =>
  String(value ?? '')
    .trim()
    .toLowerCase();

const normalizeBaseUrl = (value: string | undefined | null): string =>
  normalizeText(value).replace(/\/+$/, '');

export const resolveGroqBaseUrl = (value: string | undefined | null): string => {
  const normalized = normalizeBaseUrl(value);
  const matched = GROQ_BASE_URL_OPTIONS.find(
    (option) =>
      normalized === normalizeBaseUrl(option.baseUrl) ||
      normalized === normalizeBaseUrl(option.openaiBaseUrl)
  );
  return matched?.baseUrl ?? GROQ_BASE_URL;
};

export const getGroqProtocolUrls = (value: string | undefined | null) => {
  const baseUrl = resolveGroqBaseUrl(value);
  const matched =
    GROQ_BASE_URL_OPTIONS.find(
      (option) => normalizeBaseUrl(option.baseUrl) === normalizeBaseUrl(baseUrl)
    ) ?? GROQ_BASE_URL_OPTIONS[0];
  return {
    openai: matched.openaiBaseUrl,
    anthropic: matched.openaiBaseUrl, // Groq uses OpenAI-compatible format
    codex: matched.openaiBaseUrl,
    gemini: matched.openaiBaseUrl,
  };
};

const matchesGroqOpenAIBaseUrl = (value: string | undefined | null): boolean => {
  const normalized = normalizeBaseUrl(value);
  return GROQ_BASE_URL_OPTIONS.some(
    (option) =>
      normalized === normalizeBaseUrl(option.openaiBaseUrl)
  );
};

export const isGroqOpenAIProvider = (
  config: OpenAIProviderConfig | undefined | null
): boolean => {
  if (!config) return false;
  return matchesGroqOpenAIBaseUrl(config.baseUrl);
};

export const buildGroqRaw = (config: Config | null | undefined): SponsorProviderRaw => ({
  openai: (config?.openaiCompatibility ?? [])
    .map((item, index) => ({ config: item, index: item.sourceIndex ?? index }))
    .filter((item) => isGroqOpenAIProvider(item.config)),
  claude: [],
  codex: [],
  gemini: [],
  anthropic: [],
});

export const hasGroqConfig = (config: Config | null | undefined): boolean => {
  const raw = buildGroqRaw(config);
  return raw.openai.length > 0;
};