export type StoredSession = {
  token: string;
};

/** Persist only the bearer token. Never include a password in this blob. */
export function encodeStoredSession(token: string): string {
  return JSON.stringify({ token } satisfies StoredSession);
}

export function decodeStoredSession(raw: string): string | null {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return null;
    if ('password' in parsed || 'passwordHash' in parsed) return null;
    if (typeof parsed.token !== 'string' || parsed.token.length < 20) return null;
    return parsed.token;
  } catch {
    return null;
  }
}
