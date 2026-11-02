import '@testing-library/jest-dom/vitest';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { OAuthPage } from './OAuthPage';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useThemeStore } from '@/stores/useThemeStore';
import { oauthApi } from '@/services/api/oauth';
import { pluginsApi } from '@/services/api/plugins';
import { vertexApi } from '@/services/api/vertex';
import { notifyAuthFilesChanged } from '@/features/authFiles/authFilesEvents';

// Shared mock for navigate
const mockNavigate = vi.fn();

// Mock all external dependencies
vi.mock('@/stores/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));
vi.mock('@/stores/useNotificationStore', () => ({
  useNotificationStore: vi.fn(),
}));
vi.mock('@/stores/useThemeStore', () => ({
  useThemeStore: vi.fn(),
}));
vi.mock('@/services/api/oauth', () => ({
  oauthApi: {
    startAuth: vi.fn(),
    getAuthStatus: vi.fn(),
    submitCallback: vi.fn(),
  },
}));
vi.mock('@/services/api/plugins', () => ({
  pluginsApi: {
    list: vi.fn(),
  },
}));
vi.mock('@/services/api/vertex', () => ({
  vertexApi: {
    importCredential: vi.fn(),
  },
}));
vi.mock('@/features/authFiles/authFilesEvents', () => ({
  notifyAuthFilesChanged: vi.fn(),
}));
vi.mock('@/utils/clipboard', () => ({
  copyToClipboard: vi.fn().mockResolvedValue(true),
}));
// bun test: async factory với `await import()` chính module đang mock → circular
// deadlock (treo toàn suite). Sync factory, không spread actual.
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock i18next trả verbatim key (tương đương tests/setup.ts, bản preload bun
// không có i18n mock). Sync factory để tránh circular deadlock.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: () => Promise.resolve(), language: 'en' },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

const mockUseAuthStore = useAuthStore as unknown as ReturnType<typeof vi.fn>;
const mockUseNotificationStore = useNotificationStore as unknown as ReturnType<typeof vi.fn>;
const mockUseThemeStore = useThemeStore as unknown as ReturnType<typeof vi.fn>;
const mockOauthApi = oauthApi as unknown as {
  startAuth: ReturnType<typeof vi.fn>;
  getAuthStatus: ReturnType<typeof vi.fn>;
  submitCallback: ReturnType<typeof vi.fn>;
};
const mockPluginsApi = pluginsApi as unknown as { list: ReturnType<typeof vi.fn> };
const mockVertexApi = vertexApi as unknown as { importCredential: ReturnType<typeof vi.fn> };
const mockNotifyAuthFilesChanged = notifyAuthFilesChanged as ReturnType<typeof vi.fn>;

// delay: null — fake timers (beforeEach) patch setTimeout; userEvent mặc định
// await setTimeout(delay=0) → deadlock vĩnh viễn (đã verify: default hang, null pass).
const user = userEvent.setup({ delay: null });

// Helper to create Zustand store mock that handles both selector functions and full state access
const createStoreMock = <T,>(state: T) => {
  return vi.fn((selector?: (state: T) => unknown) => {
    if (typeof selector === 'function') {
      return selector(state);
    }
    return state;
  });
};

const vertex_import = {
  choose_file: 'vertex_import.choose_file',
  description: 'vertex_import.description',
  import_button: 'vertex_import.import_button',
  title: 'vertex_import.title',
};

const renderOAuthPage = () => {
  return render(
    <BrowserRouter>
      <OAuthPage />
    </BrowserRouter>
  );
};

describe('OAuthPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockNavigate.mockClear();

    // jsdom setup chỉ set window.open = () => null — cần spy để assert
    (window as unknown as { open: ReturnType<typeof vi.fn> }).open = vi.fn();

    // Setup default store mocks
    mockUseAuthStore.mockImplementation(createStoreMock({
      apiBase: 'http://localhost:3004',
      managementKey: 'test-key',
      isAuthenticated: true,
    }));

    mockUseNotificationStore.mockImplementation(createStoreMock({
      notifications: [],
      showNotification: vi.fn(),
    }));

    mockUseThemeStore.mockImplementation(createStoreMock({
      theme: 'auto',
      resolvedTheme: 'light',
    }));

    // Setup default API mocks
    mockOauthApi.startAuth.mockResolvedValue({ url: 'https://auth.example.com', state: 'test-state-123' });
    mockOauthApi.getAuthStatus.mockResolvedValue({ status: 'wait' });
    mockOauthApi.submitCallback.mockResolvedValue({ status: 'ok' });
    mockPluginsApi.list.mockResolvedValue({ plugins: [] });
    mockVertexApi.importCredential.mockResolvedValue({});
    mockNotifyAuthFilesChanged.mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Provider Card Rendering', () => {
    test('renders the five providers backed by a server auth-url route', () => {
      renderOAuthPage();

      expect(screen.getByText('auth_login.kimi_oauth_title')).toBeInTheDocument();
      expect(screen.getByText('auth_login.codex_oauth_title')).toBeInTheDocument();
      expect(screen.getByText('auth_login.anthropic_oauth_title')).toBeInTheDocument();
      expect(screen.getByText('auth_login.antigravity_oauth_title')).toBeInTheDocument();
      expect(screen.getByText('auth_login.xai_oauth_title')).toBeInTheDocument();
    });

    test('hides providers that have no server route and no plugin', () => {
      renderOAuthPage();

      // These providers exist only in the upstream panel; this backend has no
      // <provider>-auth-url route for them and no plugin declares them, so
      // rendering their buttons produced a 404 on every click.
      for (const titleKey of [
        'auth_login.kilo_oauth_title',
        'auth_login.meta_oauth_title',
        'auth_login.devin_oauth_title',
        'auth_login.freebuff_oauth_title',
        'auth_login.google_oauth_title',
        'auth_login.mistral_oauth_title',
        'auth_login.cohere_oauth_title',
        'auth_login.huggingface_oauth_title',
      ]) {
        expect(screen.queryByText(titleKey)).not.toBeInTheDocument();
      }
    });

    test('each provider card has correct button and hint text', () => {
      renderOAuthPage();

      expect(screen.getByText('auth_login.anthropic_oauth_button')).toBeInTheDocument();
      expect(screen.getByText('auth_login.codex_oauth_button')).toBeInTheDocument();
      expect(screen.getByText('auth_login.xai_oauth_button')).toBeInTheDocument();

      expect(screen.getByText('auth_login.anthropic_oauth_hint')).toBeInTheDocument();
      expect(screen.getByText('auth_login.codex_oauth_hint')).toBeInTheDocument();
      expect(screen.getByText('auth_login.xai_oauth_hint')).toBeInTheDocument();
    });

    test('featured provider (kimi) is rendered with sign up button', () => {
      renderOAuthPage();

      expect(screen.getByText('auth_login.kimi_sign_up_button')).toBeInTheDocument();
      expect(screen.getByText('auth_login.kimi_oauth_button')).toBeInTheDocument();
    });
  });

  describe('Auth Flow Tests', () => {
    test('clicking OAuth button calls oauthApi.startAuth with correct provider id', async () => {
      renderOAuthPage();

      const anthropicButton = screen.getByText('auth_login.anthropic_oauth_button');
      await user.click(anthropicButton);

      expect(mockOauthApi.startAuth).toHaveBeenCalledWith('anthropic');
    });

    test('clicking xAI button calls startAuth with xai id', async () => {
      renderOAuthPage();

      const xaiButton = screen.getByText('auth_login.xai_oauth_button');
      await user.click(xaiButton);

      expect(mockOauthApi.startAuth).toHaveBeenCalledWith('xai');
    });

    test('sets provider state to waiting and shows auth URL after successful startAuth', async () => {
      renderOAuthPage();

      const anthropicButton = screen.getByText('auth_login.anthropic_oauth_button');
      await user.click(anthropicButton);

      await waitFor(() => {
        expect(screen.getByText('auth_login.anthropic_oauth_status_waiting')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('https://auth.example.com')).toBeInTheDocument();
      });
    });

    test('shows error notification when startAuth fails', async () => {
      mockOauthApi.startAuth.mockRejectedValueOnce(new Error('Network error'));

      renderOAuthPage();

      const anthropicButton = screen.getByText('auth_login.anthropic_oauth_button');
      await user.click(anthropicButton);

      await waitFor(() => {
        const { showNotification } = mockUseNotificationStore.mock.results[0].value;
        expect(showNotification).toHaveBeenCalledWith(
          expect.stringContaining('auth_login.anthropic_oauth_start_error Network error'),
          'error'
        );
      });
    });

    test('shows error state when startAuth returns missing state', async () => {
      mockOauthApi.startAuth.mockResolvedValueOnce({ url: 'https://auth.example.com', state: undefined });

      renderOAuthPage();

      const anthropicButton = screen.getByText('auth_login.anthropic_oauth_button');
      await user.click(anthropicButton);

      await waitFor(() => {
        expect(
          screen.getByText((content) => content.includes('auth_login.missing_state'))
        ).toBeInTheDocument();
      });
    });
  });

  describe('Polling Tests', () => {
    test('polling checks auth status every 3 seconds', async () => {
      renderOAuthPage();

      const anthropicButton = screen.getByText('auth_login.anthropic_oauth_button');
      await user.click(anthropicButton);

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      expect(mockOauthApi.getAuthStatus).toHaveBeenCalledWith('test-state-123');
      expect(mockOauthApi.getAuthStatus).toHaveBeenCalledTimes(1);
    });

    test('on ok status: completes auth, shows success notification', async () => {
      mockOauthApi.getAuthStatus
        .mockResolvedValueOnce({ status: 'wait' })
        .mockResolvedValueOnce({ status: 'ok' });

      renderOAuthPage();

      const anthropicButton = screen.getByText('auth_login.anthropic_oauth_button');
      await user.click(anthropicButton);

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.getByText('auth_login.anthropic_oauth_status_success')).toBeInTheDocument();
      });

      const { showNotification } = mockUseNotificationStore.mock.results[0].value;
      expect(showNotification).toHaveBeenCalledWith('auth_login.anthropic_oauth_status_success', 'success');
      expect(mockNotifyAuthFilesChanged).toHaveBeenCalled();
    });

    test('on error status: sets error state, shows error notification, stops polling', async () => {
      mockOauthApi.getAuthStatus
        .mockResolvedValueOnce({ status: 'wait' })
        .mockResolvedValueOnce({ status: 'error', error: 'Auth denied' });

      renderOAuthPage();

      const anthropicButton = screen.getByText('auth_login.anthropic_oauth_button');
      await user.click(anthropicButton);

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.getByText('auth_login.anthropic_oauth_status_error Auth denied')).toBeInTheDocument();
      });

      const { showNotification } = mockUseNotificationStore.mock.results[0].value;
      expect(showNotification).toHaveBeenCalledWith(
        expect.stringContaining('auth_login.anthropic_oauth_status_error Auth denied'),
        'error'
      );
    });

    test('handles polling network errors gracefully', async () => {
      mockOauthApi.getAuthStatus
        .mockResolvedValueOnce({ status: 'wait' })
        .mockRejectedValueOnce(new Error('Network error'));

      renderOAuthPage();

      const anthropicButton = screen.getByText('auth_login.anthropic_oauth_button');
      await user.click(anthropicButton);

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.getByText('auth_login.anthropic_oauth_status_error Network error')).toBeInTheDocument();
      });
    });
  });

  describe('Callback Tests', () => {
    test('callback input is shown for anthropic (PKCE flow)', async () => {
      renderOAuthPage();

      const anthropicButton = screen.getByText('auth_login.anthropic_oauth_button');
      await user.click(anthropicButton);

      await waitFor(() => {
        expect(screen.getByText('https://auth.example.com')).toBeInTheDocument();
      });

      expect(screen.getByLabelText('auth_login.oauth_callback_label')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('auth_login.oauth_callback_placeholder')).toBeInTheDocument();
    });

    test('callback input is shown for codex', async () => {
      renderOAuthPage();

      const codexButton = screen.getByText('auth_login.codex_oauth_button');
      await user.click(codexButton);

      await waitFor(() => {
        expect(screen.getByText('https://auth.example.com')).toBeInTheDocument();
      });

      expect(screen.getByLabelText('auth_login.oauth_callback_label')).toBeInTheDocument();
    });

    test('callback input is NOT shown for kimi (device flow)', async () => {
      renderOAuthPage();

      const kimiButton = screen.getByText('auth_login.kimi_oauth_button');
      await user.click(kimiButton);

      await waitFor(() => {
        expect(screen.getByText('https://auth.example.com')).toBeInTheDocument();
      });

      expect(screen.queryByLabelText('auth_login.oauth_callback_label')).not.toBeInTheDocument();
    });

    test('xAI shows the dedicated code callback input', async () => {
      renderOAuthPage();

      const xaiButton = screen.getByText('auth_login.xai_oauth_button');
      await user.click(xaiButton);

      await waitFor(() => {
        expect(screen.getByText('https://auth.example.com')).toBeInTheDocument();
      });

      expect(screen.getByLabelText('auth_login.xai_callback_label')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('auth_login.xai_callback_placeholder')).toBeInTheDocument();
    });

    test('submitting callback calls oauthApi.submitCallback with correct parameters', async () => {
      renderOAuthPage();

      const anthropicButton = screen.getByText('auth_login.anthropic_oauth_button');
      await user.click(anthropicButton);

      await waitFor(() => {
        expect(screen.getByText('https://auth.example.com')).toBeInTheDocument();
      });

      const callbackInput = screen.getByLabelText('auth_login.oauth_callback_label');
      const testCallbackUrl = 'http://localhost:54545/callback?code=test-code&state=test-state-123';
      await user.type(callbackInput, testCallbackUrl);

      const submitButton = screen.getByText('auth_login.oauth_callback_button');
      await user.click(submitButton);

      expect(mockOauthApi.submitCallback).toHaveBeenCalledWith('anthropic', testCallbackUrl);
    });

    test('empty callback shows warning notification', async () => {
      renderOAuthPage();

      const anthropicButton = screen.getByText('auth_login.anthropic_oauth_button');
      await user.click(anthropicButton);

      await waitFor(() => {
        expect(screen.getByText('https://auth.example.com')).toBeInTheDocument();
      });

      const submitButton = screen.getByText('auth_login.oauth_callback_button');
      await user.click(submitButton);

      const { showNotification } = mockUseNotificationStore.mock.results[0].value;
      expect(showNotification).toHaveBeenCalledWith('auth_login.oauth_callback_required', 'warning');
    });

    test('shows success status when callback submission succeeds', async () => {
      renderOAuthPage();

      const anthropicButton = screen.getByText('auth_login.anthropic_oauth_button');
      await user.click(anthropicButton);

      await waitFor(() => {
        expect(screen.getByText('https://auth.example.com')).toBeInTheDocument();
      });

      const callbackInput = screen.getByLabelText('auth_login.oauth_callback_label');
      await user.type(callbackInput, 'http://localhost:54545/callback?code=test&state=test-state-123');

      const submitButton = screen.getByText('auth_login.oauth_callback_button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('auth_login.oauth_callback_status_success')).toBeInTheDocument();
      });

      const { showNotification } = mockUseNotificationStore.mock.results[0].value;
      expect(showNotification).toHaveBeenCalledWith('auth_login.oauth_callback_success', 'success');
    });

    test('shows error status when callback submission fails', async () => {
      mockOauthApi.submitCallback.mockRejectedValueOnce(new Error('Invalid callback'));

      renderOAuthPage();

      const anthropicButton = screen.getByText('auth_login.anthropic_oauth_button');
      await user.click(anthropicButton);

      await waitFor(() => {
        expect(screen.getByText('https://auth.example.com')).toBeInTheDocument();
      });

      const callbackInput = screen.getByLabelText('auth_login.oauth_callback_label');
      await user.type(callbackInput, 'http://localhost:54545/callback?code=test&state=test-state-123');

      const submitButton = screen.getByText('auth_login.oauth_callback_button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText((content) => content.includes('auth_login.oauth_callback_status_error'))
        ).toBeInTheDocument();
      });

      const { showNotification } = mockUseNotificationStore.mock.results[0].value;
      expect(showNotification).toHaveBeenCalledWith(
        expect.stringContaining('auth_login.oauth_callback_error'),
        'error'
      );
    });
  });

  describe('Copy and Open Link Actions', () => {
    test('copy link button copies URL to clipboard', async () => {
      renderOAuthPage();

      const anthropicButton = screen.getByText('auth_login.anthropic_oauth_button');
      await user.click(anthropicButton);

      await waitFor(() => {
        expect(screen.getByText('https://auth.example.com')).toBeInTheDocument();
      });

      const copyButton = screen.getByText('auth_login.anthropic_copy_link');
      await user.click(copyButton);

      const { copyToClipboard } = await import('@/utils/clipboard');
      expect(copyToClipboard).toHaveBeenCalledWith('https://auth.example.com');
    });

    test('open link button opens URL in new tab', async () => {
      renderOAuthPage();

      const anthropicButton = screen.getByText('auth_login.anthropic_oauth_button');
      await user.click(anthropicButton);

      await waitFor(() => {
        expect(screen.getByText('https://auth.example.com')).toBeInTheDocument();
      });

      const openButton = screen.getByText('auth_login.anthropic_open_link');
      await user.click(openButton);

      expect(window.open).toHaveBeenCalledWith('https://auth.example.com', '_blank', 'noopener,noreferrer');
    });
  });

  describe('View Auth Files Navigation', () => {
    test('shows "View auth files" button after successful authentication', async () => {
      mockOauthApi.getAuthStatus
        .mockResolvedValueOnce({ status: 'wait' })
        .mockResolvedValueOnce({ status: 'ok' });

      renderOAuthPage();

      const anthropicButton = screen.getByText('auth_login.anthropic_oauth_button');
      await user.click(anthropicButton);

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.getByText('auth_login.view_auth_files')).toBeInTheDocument();
      });
    });

    test('clicking view auth files calls navigate', async () => {
      mockOauthApi.getAuthStatus
        .mockResolvedValueOnce({ status: 'wait' })
        .mockResolvedValueOnce({ status: 'ok' });

      renderOAuthPage();

      const anthropicButton = screen.getByText('auth_login.anthropic_oauth_button');
      await user.click(anthropicButton);

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        const viewAuthFilesButton = screen.getByText('auth_login.view_auth_files');
        fireEvent.click(viewAuthFilesButton);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/auth-files');
    });
  });

  describe('Plugin OAuth Providers', () => {
    test('renders plugin OAuth providers when available', async () => {
      mockPluginsApi.list.mockResolvedValueOnce({
        plugins: [
          {
            id: 'test-plugin',
            name: 'Test Plugin',
            supportsOAuth: true,
            effectiveEnabled: true,
            oauthProvider: 'custom-provider',
            logo: 'test-logo.png',
            metadata: { name: 'Test Plugin' },
          },
        ],
      });

      renderOAuthPage();

      await waitFor(() => {
        expect(screen.getByText('auth_login.plugin_oauth_title')).toBeInTheDocument();
      });
    });

    test('plugin OAuth provider shows callback input', async () => {
      mockPluginsApi.list.mockResolvedValueOnce({
        plugins: [
          {
            id: 'test-plugin',
            name: 'Test Plugin',
            supportsOAuth: true,
            effectiveEnabled: true,
            oauthProvider: 'custom-provider',
            logo: 'test-logo.png',
            metadata: { name: 'Test Plugin' },
          },
        ],
      });

      renderOAuthPage();

      await waitFor(() => {
        expect(screen.getByText('auth_login.plugin_oauth_title')).toBeInTheDocument();
      });

      const pluginButton = screen.getByText('auth_login.plugin_oauth_button');
      await user.click(pluginButton);

      await waitFor(() => {
        expect(screen.getByText('https://auth.example.com')).toBeInTheDocument();
      });

      expect(screen.getByLabelText('auth_login.oauth_callback_label')).toBeInTheDocument();
    });
  });

  describe('Vertex Import Section', () => {
    test('renders Vertex JSON login section', () => {
      renderOAuthPage();

      expect(screen.getByText(vertex_import.title)).toBeInTheDocument();
      expect(screen.getByText(vertex_import.description)).toBeInTheDocument();
      expect(screen.getByLabelText('vertex_import.location_label')).toBeInTheDocument();
      expect(screen.getByText(vertex_import.choose_file)).toBeInTheDocument();
      expect(screen.getByText(vertex_import.import_button)).toBeInTheDocument();
    });
  });

  describe('Error State Recovery', () => {
    test('allows retry after error by clicking button again', async () => {
      mockOauthApi.startAuth.mockRejectedValueOnce(new Error('Network error'));

      renderOAuthPage();

      const anthropicButton = screen.getByText('auth_login.anthropic_oauth_button');
      await user.click(anthropicButton);

      await waitFor(() => {
        expect(screen.getByText('auth_login.anthropic_oauth_status_error Network error')).toBeInTheDocument();
      });

      mockOauthApi.startAuth.mockResolvedValueOnce({ url: 'https://auth.example.com', state: 'new-state' });

      await user.click(anthropicButton);

      await waitFor(() => {
        expect(screen.getByText('https://auth.example.com')).toBeInTheDocument();
        expect(screen.getByText('auth_login.anthropic_oauth_status_waiting')).toBeInTheDocument();
      });
    });
  });
});
