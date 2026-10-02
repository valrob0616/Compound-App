/** Public Supabase settings. Never read a service-role or secret key here. */
export function supabasePublicConfig(): { url: string; key: string } | null {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, '') ?? '';
  const key = process.env.EXPO_PUBLIC_SUPABASE_KEY?.trim() ?? '';
  if (!url || !key) return null;
  return { url, key };
}

export function usesSupabaseAccounts(): boolean {
  return supabasePublicConfig() !== null;
}

/** Expo sets `__DEV__`. A store bundle has it false and must not call the local file server. */
export function devAccountsAllowed(): boolean {
  const flag = (globalThis as { __DEV__?: boolean }).__DEV__;
  if (typeof flag === 'boolean') return flag;
  return process.env.NODE_ENV !== 'production';
}

export function accountsModeLabel(): string {
  return usesSupabaseAccounts() ? 'Account: Supabase' : 'Account: local server';
}

export const RELEASE_SUPABASE_ENV_MESSAGE =
  'This build needs EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY (the publishable key). It does not use the local account server.';
