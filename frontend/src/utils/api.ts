export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function request(path: string, init?: RequestInit) {
  return fetch(`${API_URL}/api${path}`, {
    credentials: 'include',
    ...init,
    headers: init?.body instanceof FormData ? init.headers : { 'Content-Type': 'application/json', ...init?.headers },
  });
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let response = await request(path, init);
  const canRefresh = response.status === 401 && !['/auth/login', '/auth/register', '/auth/refresh'].includes(path);
  if (canRefresh) {
    const refreshed = await request('/auth/refresh', { method: 'POST' });
    if (refreshed.ok) response = await request(path, init);
  }
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => ({})) as { message?: string | string[] };
  if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message[0] : data.message || 'Something went wrong');
  return data as T;
}

export const imageUrl = (path?: string) => path ? (/^https:\/\//.test(path) ? path : `${API_URL}${path}`) : undefined;
