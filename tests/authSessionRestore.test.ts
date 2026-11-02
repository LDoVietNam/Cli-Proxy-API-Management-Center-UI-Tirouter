import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { useAuthStore } from '../src/stores/useAuthStore';
import { useConfigStore } from '../src/stores/useConfigStore';

const MANUAL_LOGOUT_KEY = 'cpa_manual_logout';
const realFetchConfig = useConfigStore.getState().fetchConfig;

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function stubFetchConfig(impl: () => Promise<unknown>) {
  useConfigStore.getState().fetchConfig = impl as typeof realFetchConfig;
}

function resetSession() {
  useAuthStore.setState({
    isAuthenticated: false,
    apiBase: '',
    managementKey: '',
    rememberPassword: false,
    connectionStatus: 'disconnected',
  });
  localStorage.clear();
  sessionStorage.clear();
}

describe('management panel session restore', () => {
  beforeEach(resetSession);

  afterEach(() => {
    useConfigStore.getState().fetchConfig = realFetchConfig;
    resetSession();
  });

  it('enters without a management key when the server accepts the caller', async () => {
    useAuthStore.setState({ apiBase: 'http://127.0.0.1:3004' });
    stubFetchConfig(async () => ({}));

    expect(await useAuthStore.getState().restoreSession()).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().managementKey).toBe('');
  });

  it('falls back to the login form when the probe is rejected', async () => {
    useAuthStore.setState({ apiBase: 'http://192.168.1.18:3004' });
    stubFetchConfig(async () => {
      throw new Error('Request failed with status code 401');
    });

    expect(await useAuthStore.getState().restoreSession()).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('re-probes after a failed attempt instead of reusing the cached result', async () => {
    useAuthStore.setState({ apiBase: 'http://127.0.0.1:3004' });
    stubFetchConfig(async () => {
      throw new Error('offline');
    });
    expect(await useAuthStore.getState().restoreSession()).toBe(false);

    stubFetchConfig(async () => ({}));
    expect(await useAuthStore.getState().restoreSession()).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('does not resurrect the session when logout lands mid-probe', async () => {
    useAuthStore.setState({ apiBase: 'http://127.0.0.1:3004' });
    const request = deferred();
    stubFetchConfig(() => request.promise);

    const pending = useAuthStore.getState().restoreSession();
    useAuthStore.getState().logout();
    request.resolve();

    expect(await pending).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(sessionStorage.getItem(MANUAL_LOGOUT_KEY)).toBe('1');
  });

  it('shows the login form again after a deliberate logout', async () => {
    useAuthStore.setState({ apiBase: 'http://127.0.0.1:3004' });
    stubFetchConfig(async () => ({}));
    expect(await useAuthStore.getState().restoreSession()).toBe(true);

    useAuthStore.getState().logout();
    expect(await useAuthStore.getState().restoreSession()).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);

    // A 401 is not a deliberate logout: the next load keeps probing.
    sessionStorage.clear();
    useAuthStore.setState({ apiBase: 'http://127.0.0.1:3004' });
    expect(await useAuthStore.getState().restoreSession()).toBe(true);
  });
});
