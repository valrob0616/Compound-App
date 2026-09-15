import 'react-native-url-polyfill/auto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { PreferredCategory, UserProfile } from '@/types';
import { getAuthMode } from './mode';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;
  if (getAuthMode() !== 'supabase') {
    throw new Error('Supabase is not configured.');
  }
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;
  client = createClient(url, anonKey, {
    auth: {
      storage: Platform.OS === 'web' ? undefined : ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  return client;
}

type Meta = {
  displayName?: string;
  preferredCategory?: PreferredCategory;
};

function profileFromUser(id: string, email: string, meta: Meta): UserProfile {
  return {
    id,
    email,
    displayName: meta.displayName?.trim() || email.split('@')[0],
    preferredCategory: meta.preferredCategory ?? 'both',
  };
}

export async function supabaseGetSession(): Promise<UserProfile | null> {
  const { data, error } = await getSupabase().auth.getSession();
  if (error) throw error;
  const user = data.session?.user;
  if (!user?.email) return null;
  return profileFromUser(user.id, user.email, (user.user_metadata ?? {}) as Meta);
}

export async function supabaseSignUp(input: {
  email: string;
  password: string;
  displayName: string;
  preferredCategory?: PreferredCategory;
}): Promise<UserProfile> {
  const { data, error } = await getSupabase().auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: {
        displayName: input.displayName.trim(),
        preferredCategory: input.preferredCategory ?? 'both',
      },
    },
  });
  if (error) throw error;
  const user = data.user;
  if (!user?.email) {
    throw new Error('Check your email to confirm the account, then sign in.');
  }
  if (!data.session) {
    throw new Error('Account created. Confirm your email, then sign in.');
  }
  return profileFromUser(user.id, user.email, (user.user_metadata ?? {}) as Meta);
}

export async function supabaseSignIn(email: string, password: string): Promise<UserProfile> {
  const { data, error } = await getSupabase().auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;
  const user = data.user;
  if (!user.email) throw new Error('Signed in, but no email was returned.');
  return profileFromUser(user.id, user.email, (user.user_metadata ?? {}) as Meta);
}

export async function supabaseSignOut(): Promise<void> {
  const { error } = await getSupabase().auth.signOut();
  if (error) throw error;
}

export async function supabaseUpdateProfile(
  patch: Partial<Pick<UserProfile, 'displayName' | 'preferredCategory'>>,
): Promise<UserProfile> {
  const { data, error } = await getSupabase().auth.updateUser({ data: patch });
  if (error) throw error;
  const user = data.user;
  if (!user.email) throw new Error('Profile updated, but no email was returned.');
  return profileFromUser(user.id, user.email, (user.user_metadata ?? {}) as Meta);
}
