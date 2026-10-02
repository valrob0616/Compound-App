export type AuthStorage = {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
};

const CHUNK_PREFIX = 'hcn-chunks:';
const CHUNK_SIZE = 1800;
const MAX_CHUNKS = 8;

function hasPasswordKey(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return value.some(hasPasswordKey);
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const normalized = key.toLowerCase().replace(/_/g, '');
    if (normalized === 'password' || normalized === 'passwordhash') return true;
    if (hasPasswordKey(child)) return true;
  }
  return false;
}

/** True when a blob would persist a password. Session JSON from Supabase Auth does not. */
export function sessionBlobContainsPassword(value: string): boolean {
  try {
    return hasPasswordKey(JSON.parse(value) as unknown);
  } catch {
    return /"password"\s*:/.test(value) || /"passwordHash"\s*:/.test(value) || /"password_hash"\s*:/.test(value);
  }
}

export function createGuardedAuthStorage(inner: AuthStorage): AuthStorage {
  return {
    getItem: (key) => inner.getItem(key),
    removeItem: (key) => inner.removeItem(key),
    setItem: async (key, value) => {
      if (sessionBlobContainsPassword(value)) {
        throw new Error('Refusing to store a password on this device.');
      }
      await inner.setItem(key, value);
    },
  };
}

/**
 * SecureStore rejects values over 2048 bytes. A Supabase session is larger than that,
 * so the session is split. The password is never part of the stored session.
 */
export function createChunkedAuthStorage(inner: AuthStorage): AuthStorage {
  return createGuardedAuthStorage({
    async getItem(key) {
      const head = await inner.getItem(key);
      if (head == null || !head.startsWith(CHUNK_PREFIX)) return head;
      const count = Number(head.slice(CHUNK_PREFIX.length));
      if (!Number.isInteger(count) || count < 1 || count > MAX_CHUNKS) return null;
      const parts: string[] = [];
      for (let index = 0; index < count; index += 1) {
        const part = await inner.getItem(`${key}.${index}`);
        if (part == null) return null;
        parts.push(part);
      }
      return parts.join('');
    },
    async setItem(key, value) {
      await removeChunks(inner, key);
      if (value.length <= CHUNK_SIZE) {
        await inner.setItem(key, value);
        return;
      }
      const count = Math.ceil(value.length / CHUNK_SIZE);
      if (count > MAX_CHUNKS) {
        throw new Error('Session is too large to store on this device.');
      }
      await inner.setItem(key, `${CHUNK_PREFIX}${count}`);
      for (let index = 0; index < count; index += 1) {
        await inner.setItem(key + '.' + index, value.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE));
      }
    },
    async removeItem(key) {
      await removeChunks(inner, key);
      await inner.removeItem(key);
    },
  });
}

async function removeChunks(inner: AuthStorage, key: string): Promise<void> {
  const head = await inner.getItem(key);
  const count =
    head?.startsWith(CHUNK_PREFIX) && Number.isInteger(Number(head.slice(CHUNK_PREFIX.length)))
      ? Number(head.slice(CHUNK_PREFIX.length))
      : 0;
  const limit = Math.min(Math.max(count, 0), MAX_CHUNKS);
  for (let index = 0; index < limit; index += 1) {
    await inner.removeItem(`${key}.${index}`);
  }
}

export function memoryAuthStorage(store: Record<string, string> = {}): AuthStorage {
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => {
      store[key] = value;
    },
    removeItem: (key) => {
      delete store[key];
    },
  };
}
