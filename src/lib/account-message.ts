const UNREACHABLE = "We couldn't reach the account service. Check your connection and try again.";

/**
 * Turn local-server and Supabase failures into a sentence a person can act on.
 * Already-specific messages (wrong password, duplicate email) pass through.
 */
export function friendlyAccountError(err: unknown): string {
  const raw = err instanceof Error ? err.message.trim() : '';
  if (!raw) return 'Something went wrong. Try again.';
  if (/sign-in isn't available in this build/i.test(raw)) return raw;
  if (/confirm your email|email not confirmed/i.test(raw)) return 'Confirm your email, then sign in.';
  if (
    /EXPO_PUBLIC_|npm run server|account server|supabase dashboard|invalid api key|failed to fetch|network request failed|network error|load failed|fetch failed/i.test(
      raw,
    )
  ) {
    return UNREACHABLE;
  }
  return raw;
}
