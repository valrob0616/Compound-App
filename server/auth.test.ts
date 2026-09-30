import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  getAccountSession,
  listAccountFavorites,
  signInAccount,
  signUpAccount,
  toggleAccountFavorite,
} from '../src/lib/auth/client.ts';
import { decodeStoredSession, encodeStoredSession } from '../src/lib/auth/session.ts';
import { createAccountService } from './accounts.ts';
import { startAccountServer } from './http.ts';
import { createFileStore, createMemoryStore } from './store.ts';

const PASSWORD = 'correct-horse-battery-99';

async function service() {
  return createAccountService(createMemoryStore(), { bcryptRounds: 4 });
}

test('signup stores a bcrypt hash and returns a token, not the password', async () => {
  const accounts = await service();
  const result = await accounts.signUp({
    email: 'Ada@Example.com',
    password: PASSWORD,
    displayName: 'Ada Lovelace',
    preferredCategory: 'family-compounds',
  });

  assert.equal(result.user.email, 'ada@example.com');
  assert.equal(result.user.displayName, 'Ada Lovelace');
  assert.equal(result.user.preferredCategory, 'family-compounds');
  assert.equal('password' in result.user, false);
  assert.equal('passwordHash' in result.user, false);
  assert.equal(JSON.stringify(result).includes(PASSWORD), false);
  assert.ok(result.token.length >= 20);

  const session = await accounts.session(result.token);
  assert.equal(session.id, result.user.id);
});

test('duplicate email is rejected and a wrong password does not sign in', async () => {
  const accounts = await service();
  await accounts.signUp({ email: 'ada@example.com', password: PASSWORD, displayName: 'Ada' });
  await assert.rejects(
    () => accounts.signUp({ email: 'ada@example.com', password: 'another-password', displayName: 'Ada' }),
    /already exists/,
  );
  await assert.rejects(
    () => accounts.signIn({ email: 'ada@example.com', password: 'not-the-password' }),
    /Incorrect email or password/,
  );
  await assert.rejects(
    () => accounts.signIn({ email: 'missing@example.com', password: PASSWORD }),
    /Incorrect email or password/,
  );
});

test('favorites stay on the account and load from a second sign-in', async () => {
  const accounts = await service();
  const first = await accounts.signUp({
    email: 'ada@example.com',
    password: PASSWORD,
    displayName: 'Ada',
  });
  const saved = await accounts.toggleFavorite(first.token, {
    id: 'rss-story-1',
    kind: 'news',
    title: 'Shared well on the ridge',
    subtitle: 'Family Compound',
    url: 'https://example.com/well',
  });
  assert.equal(saved.favorited, true);
  assert.equal(saved.favorites.length, 1);

  const video = await accounts.toggleFavorite(first.token, {
    id: 'yt-hs-greening',
    kind: 'video',
    title: 'Greening the Desert',
    subtitle: 'Geoff Lawton',
    youtubeId: 'sohI6vnWZmk',
  });
  assert.equal(video.favorites[0]?.kind, 'video');

  const removed = await accounts.toggleFavorite(first.token, {
    id: 'yt-hs-greening',
    kind: 'video',
    title: 'Greening the Desert',
    youtubeId: 'sohI6vnWZmk',
  });
  assert.equal(removed.favorited, false);
  assert.equal(removed.favorites.length, 1);

  await accounts.signOut(first.token);
  await assert.rejects(() => accounts.listFavorites(first.token), /Sign in again/);

  const second = await accounts.signIn({ email: 'ADA@example.com', password: PASSWORD });
  assert.notEqual(second.token, first.token);
  const favorites = await accounts.listFavorites(second.token);
  assert.deepEqual(
    favorites.map((item) => item.id),
    ['rss-story-1'],
  );
  assert.equal(favorites[0]?.url, 'https://example.com/well');
});

test('profile update and delete remove the server account', async () => {
  const accounts = await service();
  const created = await accounts.signUp({
    email: 'ada@example.com',
    password: PASSWORD,
    displayName: 'Ada',
  });
  const updated = await accounts.updateProfile(created.token, {
    displayName: 'Ada L.',
    preferredCategory: 'both',
  });
  assert.equal(updated.displayName, 'Ada L.');
  assert.equal(updated.preferredCategory, 'both');

  await accounts.deleteAccount(created.token);
  await assert.rejects(() => accounts.session(created.token), /Sign in again/);
  await assert.rejects(
    () => accounts.signIn({ email: 'ada@example.com', password: PASSWORD }),
    /Incorrect email or password/,
  );
});

test('file store keeps the bcrypt hash and not the password', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'compound-accounts-'));
  const filePath = path.join(dir, 'accounts.json');
  try {
    const accounts = await createAccountService(createFileStore(filePath), { bcryptRounds: 4 });
    await accounts.signUp({ email: 'ada@example.com', password: PASSWORD, displayName: 'Ada' });
    const raw = await readFile(filePath, 'utf8');
    assert.equal(raw.includes(PASSWORD), false);
    assert.match(raw, /\$2[ab]\$/);
    assert.match(raw, /"passwordHash"/);

    const again = await createAccountService(createFileStore(filePath), { bcryptRounds: 4 });
    const signedIn = await again.signIn({ email: 'ada@example.com', password: PASSWORD });
    assert.equal(signedIn.user.displayName, 'Ada');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('HTTP API signup, favorites, and logs omit the password', async () => {
  const accounts = await service();
  const logs: string[] = [];
  const handle = await startAccountServer(accounts, { log: (line) => logs.push(line) });
  try {
    const created = await signUpAccount(handle.url, {
      email: 'ada@example.com',
      password: PASSWORD,
      displayName: 'Ada Lovelace',
      preferredCategory: 'homesteading',
    });
    assert.equal(JSON.stringify(created).includes(PASSWORD), false);
    assert.equal(created.user.email, 'ada@example.com');

    const session = await getAccountSession(handle.url, created.token);
    assert.equal(session.displayName, 'Ada Lovelace');

    const toggled = await toggleAccountFavorite(handle.url, created.token, {
      id: 'acreage-band',
      kind: 'learn',
      title: 'Fifty-five, or make it smaller',
      subtitle: 'Land & acreage',
    });
    assert.equal(toggled.favorited, true);

    const otherDevice = await signInAccount(handle.url, {
      email: 'ada@example.com',
      password: PASSWORD,
    });
    const favorites = await listAccountFavorites(handle.url, otherDevice.token);
    assert.equal(favorites[0]?.id, 'acreage-band');
    assert.equal(favorites[0]?.kind, 'learn');

    const joined = logs.join('\n');
    assert.equal(joined.includes(PASSWORD), false);
    assert.match(joined, /POST \/v1\/signup 201/);
    assert.match(joined, /POST \/v1\/favorites\/toggle 200/);
  } finally {
    await new Promise<void>((resolve, reject) => {
      handle.server.close((err) => (err ? reject(err) : resolve()));
    });
  }
});

test('stored session is a token only', () => {
  const encoded = encodeStoredSession('abcdefghijklmnopqrstuvwxyz012345');
  assert.deepEqual(JSON.parse(encoded), { token: 'abcdefghijklmnopqrstuvwxyz012345' });
  assert.equal(encoded.includes('password'), false);
  assert.equal(decodeStoredSession(encoded), 'abcdefghijklmnopqrstuvwxyz012345');
  assert.equal(
    decodeStoredSession(JSON.stringify({ token: 'abcdefghijklmnopqrstuvwxyz012345', password: PASSWORD })),
    null,
  );
  assert.equal(decodeStoredSession(JSON.stringify({ userId: 'demo_1' })), null);
});
