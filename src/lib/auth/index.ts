import type { FavoriteDraft, FavoriteItem, PreferredCategory, UserProfile } from '@/types';
import { deleteSecureItem, getSecureItem, setSecureItem, storageKeys } from '@/lib/storage';

import { RELEASE_SUPABASE_ENV_MESSAGE, devAccountsAllowed, usesSupabaseAccounts } from './backend';
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
import {
  deleteSupabaseAccount,
  listSupabaseFavorites,
  restoreSupabaseSession,
  signInWithSupabase,
  signOutSupabase,
  signUpWithSupabase,
  toggleSupabaseFavorite,
  updateSupabaseProfile,
} from './supabase-accounts';
import { getSupabaseClient } from './supabase-client';

let memoryToken: string | null = null;

function useSupabase(): boolean {
  if (usesSupabaseAccounts()) return true;
  if (!devAccountsAllowed()) throw new AccountApiError(RELEASE_SUPABASE_ENV_MESSAGE, 0);
  return false;
}

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
  if (useSupabase()) {
    await clearToken();
    try {
      return await restoreSupabaseSession(getSupabaseClient());
    } catch {
      return null;
    }
  }
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
  if (useSupabase()) return signUpWithSupabase(getSupabaseClient(), input);
  const result = await signUpAccount(accountApiBaseUrl(), input);
  await saveToken(result.token);
  return result.user;
}

export async function signIn(email: string, password: string): Promise<UserProfile> {
  if (useSupabase()) return signInWithSupabase(getSupabaseClient(), email, password);
  const result = await signInAccount(accountApiBaseUrl(), { email, password });
  await saveToken(result.token);
  return result.user;
}

export async function signOut(): Promise<void> {
  if (useSupabase()) {
    await signOutSupabase(getSupabaseClient());
    return;
  }
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
  if (useSupabase()) return updateSupabaseProfile(getSupabaseClient(), patch);
  const token = memoryToken;
  if (!token) throw new Error('Sign in to update your profile.');
  return updateAccountProfile(accountApiBaseUrl(), token, patch);
}

export async function deleteAccount(): Promise<void> {
  if (useSupabase()) {
    await deleteSupabaseAccount(getSupabaseClient());
    return;
  }
  const token = memoryToken;
  if (!token) throw new Error('Sign in to delete your account.');
  await deleteAccountOnServer(accountApiBaseUrl(), token);
  await clearToken();
}

export async function loadFavorites(): Promise<FavoriteItem[]> {
  if (useSupabase()) return listSupabaseFavorites(getSupabaseClient());
  const token = memoryToken;
  if (!token) return [];
  return listAccountFavorites(accountApiBaseUrl(), token);
}

export async function toggleFavorite(draft: FavoriteDraft): Promise<FavoriteItem[]> {
  if (useSupabase()) return toggleSupabaseFavorite(getSupabaseClient(), draft);
  const token = memoryToken;
  if (!token) throw new Error('Sign in to save favorites.');
  const result = await toggleAccountFavorite(accountApiBaseUrl(), token, draft);
  return result.favorites;
}
