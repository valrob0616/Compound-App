import type { SupabaseClient, User } from '@supabase/supabase-js';

import type { FavoriteDraft, FavoriteItem, FavoriteKind, PreferredCategory, UserProfile } from '../../types/index.ts';
import { AccountApiError } from './client.ts';

const CATEGORIES = new Set<PreferredCategory>(['homesteading', 'family-compounds', 'both']);
const KINDS = new Set<FavoriteKind>(['news', 'video', 'learn']);
const MAX_FAVORITES = 200;

type FavoriteRow = {
  id: string;
  kind: FavoriteKind;
  title: string;
  subtitle: string | null;
  url: string | null;
  youtube_id: string | null;
  saved_at: string;
};

function asRecord(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new AccountApiError('Expected a JSON object.', 400);
  }
  return input as Record<string, unknown>;
}

function normalizeEmail(value: unknown): string {
  if (typeof value !== 'string') throw new AccountApiError('Enter a valid email.', 400);
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AccountApiError('Enter a valid email.', 400);
  }
  return email;
}

function requirePassword(value: unknown): string {
  if (typeof value !== 'string' || value.length < 6) {
    throw new AccountApiError('Use at least 6 characters.', 400);
  }
  if (value.length > 128) throw new AccountApiError('Password is too long.', 400);
  return value;
}

function requireDisplayName(value: unknown): string {
  if (typeof value !== 'string') throw new AccountApiError('Choose a display name.', 400);
  const name = value.replace(/[\u0000-\u001F]/g, '').trim();
  if (!name) throw new AccountApiError('Choose a display name.', 400);
  if (name.length > 80) throw new AccountApiError('Display name is too long.', 400);
  return name;
}

function parseCategory(value: unknown, fallback: PreferredCategory): PreferredCategory {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !CATEGORIES.has(value as PreferredCategory)) {
    throw new AccountApiError('Choose a preferred category.', 400);
  }
  return value as PreferredCategory;
}

function cleanLine(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const text = value.replace(/[\u0000-\u001F]/g, '').trim();
  if (!text || text.length > max) return null;
  return text;
}

function parseFavorite(input: unknown): Omit<FavoriteItem, 'savedAt'> {
  const body = asRecord(input);
  const id = cleanLine(body.id, 180);
  if (!id) throw new AccountApiError('That favorite is missing an id.', 400);
  if (typeof body.kind !== 'string' || !KINDS.has(body.kind as FavoriteKind)) {
    throw new AccountApiError('That favorite has an unknown kind.', 400);
  }
  const kind = body.kind as FavoriteKind;
  const title = cleanLine(body.title, 200);
  if (!title) throw new AccountApiError('That favorite needs a title.', 400);
  const subtitle = body.subtitle === undefined ? undefined : (cleanLine(body.subtitle, 200) ?? undefined);
  let url: string | undefined;
  if (body.url !== undefined && body.url !== '') {
    if (typeof body.url !== 'string' || body.url.length > 2000 || !/^https?:\/\//i.test(body.url)) {
      throw new AccountApiError('A news favorite needs an http(s) link.', 400);
    }
    url = body.url;
  }
  let youtubeId: string | undefined;
  if (body.youtubeId !== undefined && body.youtubeId !== '') {
    if (typeof body.youtubeId !== 'string' || !/^[\w-]{6,20}$/.test(body.youtubeId)) {
      throw new AccountApiError('A video favorite needs a YouTube id.', 400);
    }
    youtubeId = body.youtubeId;
  }
  if (kind === 'news' && !url) throw new AccountApiError('A news favorite needs a link.', 400);
  if (kind === 'video' && !youtubeId) throw new AccountApiError('A video favorite needs a YouTube id.', 400);
  return { id, kind, title, subtitle, url, youtubeId };
}

export function profileFromSupabaseUser(user: User): UserProfile {
  const meta = user.user_metadata ?? {};
  const preferred = meta.preferred_category;
  const preferredCategory =
    preferred === 'homesteading' || preferred === 'family-compounds' || preferred === 'both' ? preferred : 'both';
  const fromMeta = typeof meta.display_name === 'string' ? meta.display_name.trim() : '';
  const displayName = fromMeta || user.email?.split('@')[0] || 'Member';
  return {
    id: user.id,
    email: (user.email ?? '').toLowerCase(),
    displayName,
    preferredCategory,
  };
}

function throwAuth(error: { message: string; status?: number }): never {
  const message = error.message || 'Account request failed.';
  if (/already registered/i.test(message)) {
    throw new AccountApiError('An account with that email already exists.', 409);
  }
  if (/invalid login credentials/i.test(message) || /invalid credentials/i.test(message)) {
    throw new AccountApiError('Incorrect email or password.', error.status ?? 401);
  }
  if (/email not confirmed/i.test(message)) {
    throw new AccountApiError(
      'Confirm your email, then sign in. In the Supabase dashboard, turn off Confirm email if this project has no mailer.',
      error.status ?? 401,
    );
  }
  throw new AccountApiError(message, error.status ?? 400);
}

function rowToFavorite(row: FavoriteRow): FavoriteItem {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    url: row.url ?? undefined,
    youtubeId: row.youtube_id ?? undefined,
    savedAt: row.saved_at,
  };
}

async function currentUser(client: SupabaseClient): Promise<User> {
  const { data, error } = await client.auth.getUser();
  if (error) throwAuth(error);
  if (!data.user) throw new AccountApiError('Sign in again.', 401);
  return data.user;
}

/**
 * signUp returns a session only when Confirm email is off.
 * This project confirms the address in SQL and then signs in, so the password
 * stays in memory for that one request and is not written to device storage.
 */
export async function signUpWithSupabase(
  client: SupabaseClient,
  input: { email: string; password: string; displayName: string; preferredCategory?: PreferredCategory },
): Promise<UserProfile> {
  const email = normalizeEmail(input.email);
  const password = requirePassword(input.password);
  const displayName = requireDisplayName(input.displayName);
  const preferredCategory = parseCategory(input.preferredCategory, 'both');
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        preferred_category: preferredCategory,
      },
    },
  });
  if (error) throwAuth(error);
  if (!data.user) throw new AccountApiError('Could not create the account.', 400);
  if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw new AccountApiError('An account with that email already exists.', 409);
  }
  if (data.session) return profileFromSupabaseUser(data.user);
  const signedIn = await client.auth.signInWithPassword({ email, password });
  if (signedIn.error) throwAuth(signedIn.error);
  if (!signedIn.data.user) throw new AccountApiError('Could not create the account.', 400);
  return profileFromSupabaseUser(signedIn.data.user);
}

export async function signInWithSupabase(
  client: SupabaseClient,
  emailInput: string,
  passwordInput: string,
): Promise<UserProfile> {
  const email = normalizeEmail(emailInput);
  const password = requirePassword(passwordInput);
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throwAuth(error);
  if (!data.user) throw new AccountApiError('Incorrect email or password.', 401);
  return profileFromSupabaseUser(data.user);
}

export async function restoreSupabaseSession(client: SupabaseClient): Promise<UserProfile | null> {
  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  if (sessionError || !sessionData.session) return null;
  const { data, error } = await client.auth.getUser();
  if (error) {
    if (error.status === 401) await client.auth.signOut({ scope: 'local' });
    return null;
  }
  if (!data.user) return null;
  return profileFromSupabaseUser(data.user);
}

export async function signOutSupabase(client: SupabaseClient): Promise<void> {
  const { error } = await client.auth.signOut({ scope: 'local' });
  if (error) throwAuth(error);
}

export async function updateSupabaseProfile(
  client: SupabaseClient,
  patch: Partial<Pick<UserProfile, 'displayName' | 'preferredCategory'>>,
): Promise<UserProfile> {
  const current = profileFromSupabaseUser(await currentUser(client));
  const displayName = patch.displayName === undefined ? current.displayName : requireDisplayName(patch.displayName);
  const preferredCategory = parseCategory(patch.preferredCategory, current.preferredCategory);
  const { data, error } = await client.auth.updateUser({
    data: {
      display_name: displayName,
      preferred_category: preferredCategory,
    },
  });
  if (error) throwAuth(error);
  if (!data.user) throw new AccountApiError('Could not update your profile.', 400);
  return profileFromSupabaseUser(data.user);
}

export async function deleteSupabaseAccount(client: SupabaseClient): Promise<void> {
  const { error } = await client.rpc('delete_own_account');
  if (error) throw new AccountApiError(error.message || 'Could not delete the account.', 400);
  await client.auth.signOut({ scope: 'local' });
}

export async function listSupabaseFavorites(client: SupabaseClient): Promise<FavoriteItem[]> {
  const user = await currentUser(client);
  const { data, error } = await client
    .from('favorites')
    .select('id, kind, title, subtitle, url, youtube_id, saved_at')
    .eq('user_id', user.id)
    .order('saved_at', { ascending: false });
  if (error) throw new AccountApiError(error.message || 'Could not load favorites.', 400);
  return ((data ?? []) as FavoriteRow[]).map(rowToFavorite);
}

export async function toggleSupabaseFavorite(client: SupabaseClient, draftInput: FavoriteDraft): Promise<FavoriteItem[]> {
  const draft = parseFavorite(draftInput);
  const user = await currentUser(client);
  const existing = await listSupabaseFavorites(client);
  const already = existing.some((item) => item.id === draft.id);
  if (already) {
    const { error } = await client.from('favorites').delete().eq('user_id', user.id).eq('id', draft.id);
    if (error) throw new AccountApiError(error.message || 'Could not update favorites.', 400);
  } else {
    if (existing.length >= MAX_FAVORITES) throw new AccountApiError('Favorites list is full.', 400);
    const { error } = await client.from('favorites').insert({
      user_id: user.id,
      id: draft.id,
      kind: draft.kind,
      title: draft.title,
      subtitle: draft.subtitle ?? null,
      url: draft.url ?? null,
      youtube_id: draft.youtubeId ?? null,
    });
    if (error) throw new AccountApiError(error.message || 'Could not update favorites.', 400);
  }
  return listSupabaseFavorites(client);
}
