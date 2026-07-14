import { ENDPOINTS } from './endpoints';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
let csrfToken: string | null = null;
let endingSession: Promise<void> | null = null;

async function request(path: string, init?: RequestInit) {
  const method = (init?.method ?? 'GET').toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && path !== ENDPOINTS.auth.csrf) {
    csrfToken ??= await fetch(`${API_URL}/api${ENDPOINTS.auth.csrf}`, { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not initialize request security');
        return (await response.json() as { csrfToken: string }).csrfToken;
      });
  }
  return fetch(`${API_URL}/api${path}`, {
    credentials: 'include',
    ...init,
    headers: init?.body instanceof FormData
      ? { ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}), ...init.headers }
      : { 'Content-Type': 'application/json', ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}), ...init?.headers },
  });
}

function endSession() {
  endingSession ??= (async () => {
    try {
      await request(ENDPOINTS.auth.logout, { method: 'POST' });
    } catch {
      // Navigation still proceeds if the API is temporarily unavailable.
    }
    csrfToken = null;
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.replace('/login');
    }
  })();
  return endingSession;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let response = await request(path, init);
  const noRefreshEndpoints: readonly string[] = [ENDPOINTS.auth.login, ENDPOINTS.auth.register, ENDPOINTS.auth.refresh];
  const canRefresh = response.status === 401 && !noRefreshEndpoints.includes(path);
  if (canRefresh) {
    const refreshed = await request(ENDPOINTS.auth.refresh, { method: 'POST' });
    if (refreshed.ok) response = await request(path, init);
  }
  if (response.status === 401 && !noRefreshEndpoints.includes(path)) {
    await endSession();
    throw new Error('Your session has expired. Please log in again.');
  }
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => ({})) as { message?: string | string[] };
  if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message[0] : data.message || 'Something went wrong');
  return data as T;
}

export const imageUrl = (path?: string) => path ? (/^https:\/\//.test(path) ? path : `${API_URL}${path}`) : undefined;
