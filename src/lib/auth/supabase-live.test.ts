import assert from 'node:assert/strict';
import test from 'node:test';

import { createClient } from '@supabase/supabase-js';

import {
  deleteSupabaseAccount,
  listSupabaseFavorites,
  signInWithSupabase,
  signOutSupabase,
  signUpWithSupabase,
  toggleSupabaseFavorite,
} from './supabase-accounts.ts';
import { memoryAuthStorage } from './session-storage.ts';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY?.trim();
const live = Boolean(url && key);

function client() {
  return createClient(url!, key!, {
    auth: {
      storage: memoryAuthStorage(),
      autoRefreshToken: false,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'implicit',
    },
  });
}

test('live supabase signup and favorites round-trip', { skip: !live }, async () => {
  const stamp = Date.now();
  const email = `compound.live.${stamp}@gmail.com`;
  const otherEmail = `compound.other.${stamp}@gmail.com`;
  const password = `battery-horse-${stamp}-ok`;
  const first = client();
  const second = client();
  const anon = client();
  try {
    const created = await signUpWithSupabase(first, {
      email,
      password,
      displayName: 'Live Ada',
      preferredCategory: 'family-compounds',
    });
    assert.equal(created.email, email);
    assert.equal(created.displayName, 'Live Ada');
    assert.equal(created.preferredCategory, 'family-compounds');
    assert.equal(JSON.stringify(created).includes(password), false);

    const saved = await toggleSupabaseFavorite(first, {
      id: 'rss-story-1',
      kind: 'news',
      title: 'Shared well on the ridge',
      subtitle: 'Family Compound',
      url: 'https://example.com/well',
    });
    assert.equal(saved[0]?.id, 'rss-story-1');

    await signOutSupabase(first);
    const fresh = client();
    const signedIn = await signInWithSupabase(fresh, email.toUpperCase(), password);
    assert.equal(signedIn.id, created.id);
    const favorites = await listSupabaseFavorites(fresh);
    assert.equal(favorites[0]?.kind, 'news');
    assert.equal(favorites[0]?.url, 'https://example.com/well');

    await signUpWithSupabase(second, {
      email: otherEmail,
      password,
      displayName: 'Live Bea',
    });
    const hidden = await listSupabaseFavorites(second);
    assert.equal(
      hidden.some((item) => item.id === 'rss-story-1'),
      false,
    );

    const { data: anonRows, error: anonError } = await anon.from('favorites').select('id, user_id');
    if (!anonError) {
      assert.equal((anonRows ?? []).some((row) => (row as { id?: string }).id === 'rss-story-1'), false);
    }

    await deleteSupabaseAccount(fresh);
    await assert.rejects(() => signInWithSupabase(client(), email, password), /Incorrect email or password|Invalid/);
  } finally {
    try {
      await deleteSupabaseAccount(second);
    } catch {
      // The second account may already be gone, or signup may have failed.
    }
  }
});
