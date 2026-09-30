import type { FavoriteDraft, FavoriteItem, PreferredCategory, UserProfile } from '../../types/index.ts';

export class AccountApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'AccountApiError';
    this.status = status;
  }
}

export type AuthPayload = {
  token: string;
  user: UserProfile;
};

export function accountApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  return 'http://localhost:8787';
}

async function request<T>(
  baseUrl: string,
  path: string,
  init: { method: string; token?: string; body?: unknown },
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: init.method,
      headers: {
        Accept: 'application/json',
        ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(init.token ? { Authorization: `Bearer ${init.token}` } : {}),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new AccountApiError(
      'Could not reach the account server. Start it with npm run server, or set EXPO_PUBLIC_API_URL.',
      0,
    );
  }

  const text = await response.text();
  let payload: { error?: string } = {};
  if (text) {
    try {
      payload = JSON.parse(text) as { error?: string };
    } catch {
      payload = {};
    }
  }
  if (!response.ok) {
    throw new AccountApiError(payload.error || `Account server error (${response.status}).`, response.status);
  }
  return payload as T;
}

export function signUpAccount(
  baseUrl: string,
  input: { email: string; password: string; displayName: string; preferredCategory?: PreferredCategory },
): Promise<AuthPayload> {
  return request(baseUrl, '/v1/signup', { method: 'POST', body: input });
}

export function signInAccount(
  baseUrl: string,
  input: { email: string; password: string },
): Promise<AuthPayload> {
  return request(baseUrl, '/v1/signin', { method: 'POST', body: input });
}

export async function getAccountSession(baseUrl: string, token: string): Promise<UserProfile> {
  const payload = await request<{ user: UserProfile }>(baseUrl, '/v1/session', { method: 'GET', token });
  return payload.user;
}

export function signOutAccount(baseUrl: string, token: string): Promise<void> {
  return request(baseUrl, '/v1/signout', { method: 'POST', token });
}

export async function updateAccountProfile(
  baseUrl: string,
  token: string,
  patch: Partial<Pick<UserProfile, 'displayName' | 'preferredCategory'>>,
): Promise<UserProfile> {
  const payload = await request<{ user: UserProfile }>(baseUrl, '/v1/profile', {
    method: 'PATCH',
    token,
    body: patch,
  });
  return payload.user;
}

export function deleteAccountOnServer(baseUrl: string, token: string): Promise<void> {
  return request(baseUrl, '/v1/account', { method: 'DELETE', token });
}

export async function listAccountFavorites(baseUrl: string, token: string): Promise<FavoriteItem[]> {
  const payload = await request<{ favorites: FavoriteItem[] }>(baseUrl, '/v1/favorites', {
    method: 'GET',
    token,
  });
  return payload.favorites;
}

export function toggleAccountFavorite(
  baseUrl: string,
  token: string,
  draft: FavoriteDraft,
): Promise<{ favorites: FavoriteItem[]; favorited: boolean }> {
  return request(baseUrl, '/v1/favorites/toggle', { method: 'POST', token, body: draft });
}
