import type { AuthMode } from '@/types';

export function getAuthMode(): AuthMode {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (url && key && /^https?:\/\//.test(url) && key.length > 20) {
    return 'supabase';
  }
  return 'demo';
}

export function isSupabaseConfigured(): boolean {
  return getAuthMode() === 'supabase';
}
