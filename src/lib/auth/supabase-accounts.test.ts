import assert from 'node:assert/strict';
import test from 'node:test';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import {
  listSupabaseFavorites,
  signInWithSupabase,
  signOutSupabase,
  signUpWithSupabase,
  toggleSupabaseFavorite,
  updateSupabaseProfile,
  deleteSupabaseAccount,
} from './supabase-accounts.ts';
import {
  createChunkedAuthStorage,
  memoryAuthStorage,
  sessionBlobContainsPassword,
} from './session-storage.ts';

const PASSWORD = 'correct-horse-battery-99';

type FakeUser = {
  id: string;
  email: string;
  password: string;
  user_metadata: Record<string, unknown>;
  created: boolean;
};

type FavoriteRow = {
  user_id: string;
  id: string;
  kind: string;
  title: string;
  subtitle: string | null;
  url: string | null;
  youtube_id: string | null;
  saved_at: string;
};

function userJson(user: FakeUser, identities: unknown[]) {
  return {
    id: user.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: user.email,
    email_confirmed_at: '2026-10-02T00:00:00.000Z',
    phone: '',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: user.user_metadata,
    identities,
    created_at: '2026-10-02T00:00:00.000Z',
    updated_at: '2026-10-02T00:00:00.000Z',
    is_anonymous: false,
  };
}

function identityFor(user: FakeUser) {
  return {
    identity_id: `ident-${user.id}`,
    id: user.id,
    user_id: user.id,
    identity_data: { email: user.email, sub: user.id },
    provider: 'email',
    created_at: '2026-10-02T00:00:00.000Z',
    updated_at: '2026-10-02T00:00:00.000Z',
  };
}

function createMock(options?: { sessionOnSignup?: boolean }) {
  const users = new Map<string, FakeUser>();
  const tokens = new Map<string, string>();
  const favorites: FavoriteRow[] = [];
  let seq = 0;
  const sessionOnSignup = options?.sessionOnSignup ?? false;

  function issue(user: FakeUser) {
    const access = `access-${user.id}-${++seq}`;
    const refresh = `refresh-${user.id}-${seq}`;
    tokens.set(access, user.id);
    return {
      access_token: access,
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: refresh,
      user: userJson(user, [identityFor(user)]),
    };
  }

  function bearer(headers: Headers): string | null {
    const value = headers.get('Authorization') ?? headers.get('authorization');
    if (!value?.toLowerCase().startsWith('bearer ')) return null;
    return value.slice(7);
  }

  function userFrom(headers: Headers): FakeUser | null {
    const token = bearer(headers);
    if (!token) return null;
    const id = tokens.get(token);
    if (!id) return null;
    return users.get(id) ?? null;
  }

  const fetchImpl: typeof fetch = async (input, init) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
    const method = (init?.method ?? 'GET').toUpperCase();
    const headers = new Headers(init?.headers);
    const rawBody = typeof init?.body === 'string' ? init.body : '';
    const body = rawBody ? (JSON.parse(rawBody) as Record<string, unknown>) : {};
    const json = (status: number, payload: unknown) =>
      new Response(JSON.stringify(payload), {
        status,
        headers: { 'Content-Type': 'application/json' },
      });

    if (url.pathname.endsWith('/auth/v1/signup') && method === 'POST') {
      const email = String(body.email ?? '').toLowerCase();
      const existing = [...users.values()].find((item) => item.email === email);
      if (existing) {
        if (sessionOnSignup) return json(400, { msg: 'User already registered', error_code: 'user_already_exists' });
        return json(200, userJson(existing, []));
      }
      const user: FakeUser = {
        id: `user-${++seq}`,
        email,
        password: String(body.password ?? ''),
        user_metadata: (body.data as Record<string, unknown>) ?? {},
        created: true,
      };
      users.set(user.id, user);
      if (sessionOnSignup) return json(200, issue(user));
      return json(200, userJson(user, [identityFor(user)]));
    }

    if (url.pathname.endsWith('/auth/v1/token') && url.searchParams.get('grant_type') === 'password') {
      const email = String(body.email ?? '').toLowerCase();
      const user = [...users.values()].find((item) => item.email === email);
      if (!user || user.password !== body.password) {
        return json(400, { error: 'invalid_grant', msg: 'Invalid login credentials' });
      }
      return json(200, issue(user));
    }

    if (url.pathname.endsWith('/auth/v1/user') && method === 'GET') {
      const user = userFrom(headers);
      if (!user) return json(401, { msg: 'invalid claim' });
      return json(200, userJson(user, [identityFor(user)]));
    }

    if (url.pathname.endsWith('/auth/v1/user') && method === 'PUT') {
      const user = userFrom(headers);
      if (!user) return json(401, { msg: 'invalid claim' });
      const data = body.data;
      if (data && typeof data === 'object') {
        user.user_metadata = { ...user.user_metadata, ...(data as Record<string, unknown>) };
      }
      return json(200, userJson(user, [identityFor(user)]));
    }

    if (url.pathname.endsWith('/auth/v1/logout') && method === 'POST') {
      const token = bearer(headers);
      if (token) tokens.delete(token);
      return new Response(null, { status: 204 });
    }

    if (url.pathname.endsWith('/rest/v1/favorites')) {
      const user = userFrom(headers);
      if (!user) return json(401, { message: 'JWT required', code: '401' });
      if (method === 'GET') {
        const rows = favorites
          .filter((row) => row.user_id === user.id)
          .sort((a, b) => (a.saved_at < b.saved_at ? 1 : -1));
        return json(200, rows);
      }
      if (method === 'POST') {
        favorites.push({
          user_id: String(body.user_id),
          id: String(body.id),
          kind: String(body.kind),
          title: String(body.title),
          subtitle: (body.subtitle as string | null) ?? null,
          url: (body.url as string | null) ?? null,
          youtube_id: (body.youtube_id as string | null) ?? null,
          saved_at: new Date().toISOString(),
        });
        return json(201, []);
      }
      if (method === 'DELETE') {
        const id = url.searchParams.get('id')?.replace(/^eq\./, '');
        const userId = url.searchParams.get('user_id')?.replace(/^eq\./, '');
        for (let index = favorites.length - 1; index >= 0; index -= 1) {
          const row = favorites[index];
          if (row && row.user_id === user.id && row.id === id && row.user_id === userId) favorites.splice(index, 1);
        }
        return json(200, []);
      }
    }

    if (url.pathname.endsWith('/rest/v1/rpc/delete_own_account') && method === 'POST') {
      const user = userFrom(headers);
      if (!user) return json(401, { message: 'JWT required', code: '401' });
      users.delete(user.id);
      for (let index = favorites.length - 1; index >= 0; index -= 1) {
        if (favorites[index]?.user_id === user.id) favorites.splice(index, 1);
      }
      return json(200, null);
    }

    return json(500, { message: `unexpected ${method} ${url.pathname}${url.search}` });
  };

  function clientFor(store: Record<string, string>): SupabaseClient {
    return createClient('https://accounts.test', 'sb_publishable_test', {
      auth: {
        storage: createChunkedAuthStorage(memoryAuthStorage(store)),
        autoRefreshToken: false,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'implicit',
      },
      global: { fetch: fetchImpl },
    });
  }

  return { clientFor, users, favorites };
}

test('chunked session storage keeps a long session and rejects a password', async () => {
  const backend = memoryAuthStorage();
  const storage = createChunkedAuthStorage(backend);
  const session = JSON.stringify({ access_token: 'a'.repeat(2500), refresh_token: 'refresh-token-value', user: { id: 'u' } });
  await storage.setItem('sb-test-auth-token', session);
  assert.equal(await storage.getItem('sb-test-auth-token'), session);
  assert.equal(sessionBlobContainsPassword(session), false);
  await assert.rejects(
    () => storage.setItem('sb-test-auth-token', JSON.stringify({ token: 'a'.repeat(30), password: PASSWORD })),
    /password/i,
  );
  const stored = JSON.stringify(backend);
  assert.equal(stored.includes(PASSWORD), false);
});

test('supabase signup returns a profile and does not store the password', async () => {
  const mock = createMock({ sessionOnSignup: true });
  const store: Record<string, string> = {};
  const client = mock.clientFor(store);
  const user = await signUpWithSupabase(client, {
    email: 'Ada@Example.com',
    password: PASSWORD,
    displayName: 'Ada Lovelace',
    preferredCategory: 'family-compounds',
  });
  assert.equal(user.email, 'ada@example.com');
  assert.equal(user.displayName, 'Ada Lovelace');
  assert.equal(user.preferredCategory, 'family-compounds');
  assert.equal(JSON.stringify(user).includes(PASSWORD), false);
  assert.equal(JSON.stringify(store).includes(PASSWORD), false);
  assert.equal(sessionBlobContainsPassword(Object.values(store).join('\n')), false);

  await assert.rejects(
    () =>
      signUpWithSupabase(client, {
        email: 'ada@example.com',
        password: 'another-password',
        displayName: 'Ada',
      }),
    /already exists/,
  );
});

test('favorites round-trip after sign-out when signup has no session yet', async () => {
  const mock = createMock({ sessionOnSignup: false });
  const firstStore: Record<string, string> = {};
  const first = mock.clientFor(firstStore);
  const created = await signUpWithSupabase(first, {
    email: 'ada@example.com',
    password: PASSWORD,
    displayName: 'Ada',
  });
  assert.equal(created.displayName, 'Ada');
  assert.equal(JSON.stringify(firstStore).includes(PASSWORD), false);
  await assert.rejects(
    () =>
      signUpWithSupabase(first, {
        email: 'ada@example.com',
        password: 'another-password',
        displayName: 'Ada',
      }),
    /already exists/,
  );

  const saved = await toggleSupabaseFavorite(first, {
    id: 'rss-story-1',
    kind: 'news',
    title: 'Shared well on the ridge',
    subtitle: 'Family Compound',
    url: 'https://example.com/well',
  });
  assert.equal(saved[0]?.id, 'rss-story-1');
  assert.equal(saved[0]?.url, 'https://example.com/well');

  await toggleSupabaseFavorite(first, {
    id: 'yt-hs-greening',
    kind: 'video',
    title: 'Greening the Desert',
    subtitle: 'Geoff Lawton',
    youtubeId: 'sohI6vnWZmk',
  });
  const removed = await toggleSupabaseFavorite(first, {
    id: 'yt-hs-greening',
    kind: 'video',
    title: 'Greening the Desert',
    youtubeId: 'sohI6vnWZmk',
  });
  assert.deepEqual(
    removed.map((item) => item.id),
    ['rss-story-1'],
  );

  await signOutSupabase(first);
  assert.equal(Object.keys(firstStore).length, 0);

  const secondStore: Record<string, string> = {};
  const second = mock.clientFor(secondStore);
  const again = await signInWithSupabase(second, 'ADA@example.com', PASSWORD);
  assert.equal(again.id, created.id);
  const favorites = await listSupabaseFavorites(second);
  assert.equal(favorites[0]?.id, 'rss-story-1');
  assert.equal(JSON.stringify(secondStore).includes(PASSWORD), false);

  await assert.rejects(() => signInWithSupabase(second, 'ada@example.com', 'not-the-password'), /Incorrect email or password/);

  const otherStore: Record<string, string> = {};
  const other = mock.clientFor(otherStore);
  await signUpWithSupabase(other, {
    email: 'bea@example.com',
    password: PASSWORD,
    displayName: 'Bea',
  });
  const otherFavorites = await listSupabaseFavorites(other);
  assert.equal(otherFavorites.length, 0);

  const updated = await updateSupabaseProfile(second, { displayName: 'Ada L.', preferredCategory: 'both' });
  assert.equal(updated.displayName, 'Ada L.');
  assert.equal(updated.preferredCategory, 'both');

  await deleteSupabaseAccount(second);
  await assert.rejects(() => signInWithSupabase(mock.clientFor({}), 'ada@example.com', PASSWORD), /Incorrect email or password/);
});
