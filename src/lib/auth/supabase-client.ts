import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { deleteSecureItem, getSecureItem, setSecureItem } from '@/lib/storage';
import { supabasePublicConfig } from './backend';
import { createChunkedAuthStorage, type AuthStorage } from './session-storage';

let client: SupabaseClient | null = null;
let refreshBound = false;

function deviceAuthStorage(): AuthStorage {
  const secure: AuthStorage = {
    getItem: (key) => getSecureItem(key),
    setItem: (key, value) => setSecureItem(key, value),
    removeItem: (key) => deleteSecureItem(key),
  };
  return createChunkedAuthStorage(secure);
}

function bindAutoRefresh(supabase: SupabaseClient): void {
  if (refreshBound || Platform.OS === 'web') return;
  refreshBound = true;
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      void supabase.auth.startAutoRefresh();
    } else {
      void supabase.auth.stopAutoRefresh();
    }
  });
}

/** Expo client. Session storage is the device secure store (browser storage on web). No service-role key. */
export function getSupabaseClient(): SupabaseClient {
  const config = supabasePublicConfig();
  if (!config) {
    throw new Error('Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY.');
  }
  if (!client) {
    client = createClient(config.url, config.key, {
      auth: {
        storage: deviceAuthStorage(),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'implicit',
      },
    });
    bindAutoRefresh(client);
  }
  return client;
}
