/**
 * apiFetch — drop-in wrapper around fetch() that automatically attaches
 * the Authorization header from localStorage.
 *
 * Usage (identical to fetch):
 *   const res = await apiFetch('/api/sales', { method: 'POST', body: JSON.stringify(data) });
 *
 * - Always sets Content-Type: application/json unless you override it.
 * - Reads the token from localStorage on every call so it stays fresh.
 * - Safe to use in components, hooks, and utility files.
 */
export async function apiFetch(url, options = {}) {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return fetch(url, { ...options, headers });
}
