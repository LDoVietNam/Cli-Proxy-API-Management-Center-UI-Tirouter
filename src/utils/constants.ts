/**
 * Constant definitions
 * Migrated from original project src/utils/constants.js
 */

import type { Language } from '@/types';

const defineLanguageOrder = <T extends readonly Language[]>(
  languages: T & ([Language] extends [T[number]] ? unknown : never)
) => languages;

// Cache expiry (ms)
export const CACHE_EXPIRY_MS = 30 * 1000; // Keep consistent with baseline, reduce management load

// Network and version info
export const DEFAULT_API_PORT = 8317;
export const MANAGEMENT_API_PREFIX = '/v0/management';
export const REQUEST_TIMEOUT_MS = 30 * 1000;
export const CPA_VERSION_HEADER_KEYS = ['x-cpa-version'];
export const CPA_BUILD_DATE_HEADER_KEYS = ['x-cpa-build-date'];
export const CPA_SUPPORT_PLUGIN_HEADER_KEYS = ['x-cpa-support-plugin'];
export const VERSION_HEADER_KEYS = [...CPA_VERSION_HEADER_KEYS, 'x-server-version'];
export const BUILD_DATE_HEADER_KEYS = [...CPA_BUILD_DATE_HEADER_KEYS, 'x-server-build-date'];

// Log related
export const LOGS_TIMEOUT_MS = 60 * 1000;

// Auth file pagination
export const MAX_AUTH_FILE_SIZE = 10 * 1024 * 1024;

// Local storage keys
export const STORAGE_KEY_AUTH = 'cli-proxy-auth';
export const STORAGE_KEY_THEME = 'cli-proxy-theme';
export const STORAGE_KEY_LANGUAGE = 'cli-proxy-language';

// Language configuration
export const LANGUAGE_ORDER = defineLanguageOrder(['en', 'ru', 'vi'] as const);
export const LANGUAGE_LABEL_KEYS: Record<Language, string> = {
  en: 'language.english',
  ru: 'language.russian',
  vi: 'language.vietnamese',
};
export const SUPPORTED_LANGUAGES = LANGUAGE_ORDER;

// Notification duration
export const NOTIFICATION_DURATION_MS = 3000;
