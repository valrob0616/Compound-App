import type { FavoriteDraft, FavoriteItem, PreferredCategory, UserProfile } from '@/types';
import { deleteSecureItem, getSecureItem, setSecureItem, storageKeys } from '@/lib/storage';

import {
  AccountApiError,
  accountApiBaseUrl,
  deleteAccountOnServer,
  getAccountSession,
  listAccountFavorites,
  signInAccount,
  signOutAccount,
  signUpAccount,
  toggleAccountFavorite,
  updateAccountProfile,
} from './client';
import { decodeStoredSession, encodeStoredSession } from './session';

let memoryToken: string | null = null;

async function saveToken(token: string): Promise<void> {
  memoryToken = token;
  await setSecureItem(storageKeys.sessionToken, encodeStoredSession(token));
}

async function clearToken(): Promise<void> {
  memoryToken = null;
  await deleteSecureItem(storageKeys.sessionToken);
}

export function currentSessionToken(): string | null {
  return memoryToken;
}

export async function restoreSession(): Promise<UserProfile | null> {
  const raw = await getSecureItem(storageKeys.sessionToken);
  if (!raw) {
    memoryToken = null;
    return null;
  }
  const token = decodeStoredSession(raw);
  if (!token) {
    await clearToken();
    return null;
  }
  memoryToken = token;
  try {
    return await getAccountSession(accountApiBaseUrl(), token);
  } catch (err) {
    if (err instanceof AccountApiError && err.status === 401) {
      await clearToken();
    }
    return null;
  }
}

export async function signUp(input: {
  email: string;
  password: string;
  displayName: string;
  preferredCategory?: PreferredCategory;
}): Promise<UserProfile> {
  const result = await signUpAccount(accountApiBaseUrl(), input);
  await saveToken(result.token);
  return result.user;
}

export async function signIn(email: string, password: string): Promise<UserProfile> {
  const result = await signInAccount(accountApiBaseUrl(), { email, password });
  await saveToken(result.token);
  return result.user;
}

export async function signOut(): Promise<void> {
  const token = memoryToken;
  if (token) {
    try {
      await signOutAccount(accountApiBaseUrl(), token);
    } catch {
      // The device session is cleared either way. A leftover server session
      // cannot be reused without the token, which is not kept.
    }
  }
  await clearToken();
}

export async function updateProfile(
  patch: Partial<Pick<UserProfile, 'displayName' | 'preferredCategory'>>,
): Promise<UserProfile> {
  const token = memoryToken;
  if (!token) throw new Error('Sign in to update your profile.');
  return updateAccountProfile(accountApiBaseUrl(), token, patch);
}

export async function deleteAccount(): Promise<void> {
  const token = memoryToken;
  if (!token) throw new Error('Sign in to delete your account.');
  await deleteAccountOnServer(accountApiBaseUrl(), token);
  await clearToken();
}

export async function loadFavorites(): Promise<FavoriteItem[]> {
  const token = memoryToken;
  if (!token) return [];
  return listAccountFavorites(accountApiBaseUrl(), token);
}

export async function toggleFavorite(draft: FavoriteDraft): Promise<FavoriteItem[]> {
  const token = memoryToken;
  if (!token) throw new Error('Sign in to save favorites.');
  const result = await toggleAccountFavorite(accountApiBaseUrl(), token, draft);
  return result.favorites;
}
