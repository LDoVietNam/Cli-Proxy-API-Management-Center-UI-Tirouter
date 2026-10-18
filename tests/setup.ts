import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock i18next to return keys directly for fast testing, but provide translations for meta_quota keys
const metaQuotaTranslations: Record<string, string> = {
  'meta_quota.active': 'Subscription active',
  'meta_quota.inactive': 'Subscription inactive',
  'meta_quota.window': 'Usage window',
  'meta_quota.weekly': 'Weekly quota',
  'meta_quota.unknown': 'Unknown',
  'meta_quota.empty_data': 'Quota unknown. You may not have made a model request yet.',
  'meta_quota.loading': 'Querying Muse quota…',
  'meta_quota.error': 'Error',
  'meta_quota.plan_label': 'Plan',
  'meta_quota.active': 'Subscription active',
  'meta_quota.window': 'Usage window',
  'meta_quota.weekly': 'Weekly quota',
  'meta_quota.unknown': 'Unknown',
  'meta_quota.empty_data': 'Quota unknown. You may not have made a model request yet.',
  'meta_quota.loading': 'Querying Muse quota…',
  'meta_quota.error': 'Error',
  'meta_quota.plan_label': 'Plan',
  'meta_quota.active': 'Subscription active',
  'meta_quota.window': 'Usage window',
  'meta_quota.weekly': 'Weekly quota',
  'meta_quota.unknown': 'Unknown',
  'meta_quota.empty_data': 'Quota unknown. You may not have made a model request yet.',
  'meta_quota.loading': 'Querying Muse quota…',
  'meta_quota.error': 'Error',
  'meta_quota.plan_label': 'Plan',
  'meta_quota.active': 'Subscription active',
  'meta_quota.window': 'Usage window',
  'meta_quota.weekly': 'Weekly quota',
  'meta_quota.unknown': 'Unknown',
};

const translations: Record<string, string> = {
  ...metaQuotaTranslations,
  'meta_quota.title': 'Muse (Meta) Quota',
  'meta_quota.empty_title': 'No Muse credentials',
  'meta_quota.empty_desc': 'Sign in with Muse OAuth or upload a Meta credential file to query quota.',
  'meta_quota.idle': 'Click to query Muse quota',
  'meta_quota.loading': 'Querying Muse quota…',
  'meta_quota.load_failed': 'Failed to query Muse quota: {{message}}',
  'meta_quota.missing_auth_index': 'Auth file missing auth_index',
  'meta_quota.missing_file': 'Quota requires a downloadable Meta authentication file.',
  'meta_quota.missing_dca_token': 'The authentication file has no valid dca_token. Sign in with Muse OAuth again.',
  'meta_quota.invalid_auth_file': 'The downloaded authentication file is not valid JSON.',
  'meta_quota.download_failed': 'Could not download the authentication file for quota lookup.',
  'meta_quota.stale_request': 'The connection or credential changed. Please retry.',
  'meta_quota.plan': 'Plan',
  'meta_quota.active': 'Subscription active',
  'meta_quota.inactive': 'Subscription inactive',
  'meta_quota.window': 'Usage window',
  'meta_quota.window_duration': '{{minutes}}-minute window',
  'meta_quota.weekly': 'Weekly quota',
  'meta_quota.unknown': 'Unknown',
  'meta_quota.remaining': '{{percent}}% remaining',
};

vi.mock('react-i18next', async () => {
  const actual = await vi.importActual('react-i18next');
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, options?: Record<string, string>) => {
        if (options) {
          return Object.entries(options).reduce(
            (str, [k, v]) => str.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v),
            translations[key] || key
          );
        }
        return translations[key] || key;
      },
      i18n: {
        changeLanguage: vi.fn().mockResolvedValue(undefined),
        language: 'en',
      },
    }),
    I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
    initReactI18next: {
      type: '3rdParty',
      init: vi.fn(),
    },
  };
});

// Mock matchMedia for theme store
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock window.open
window.open = vi.fn();

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
  writable: true,
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Suppress console.error in tests for known warnings
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('act(...)') || args[0].includes('Warning: A vi.mock'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});