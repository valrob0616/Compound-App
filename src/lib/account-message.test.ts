import assert from 'node:assert/strict';
import test from 'node:test';

import { friendlyAccountError } from './account-message.ts';

test('account errors stay human on the local server and on Supabase', () => {
  assert.equal(friendlyAccountError(new Error('')), 'Something went wrong. Try again.');
  assert.equal(friendlyAccountError('nope'), 'Something went wrong. Try again.');
  assert.equal(
    friendlyAccountError(new Error('Incorrect email or password.')),
    'Incorrect email or password.',
  );
  assert.equal(
    friendlyAccountError(new Error('An account with that email already exists.')),
    'An account with that email already exists.',
  );
  assert.equal(
    friendlyAccountError(new Error('Email not confirmed. Check the Supabase dashboard.')),
    'Confirm your email, then sign in.',
  );
  assert.equal(
    friendlyAccountError(new Error("Sign-in isn't available in this build. You can keep browsing as a guest.")),
    "Sign-in isn't available in this build. You can keep browsing as a guest.",
  );
  const unreachable = "We couldn't reach the account service. Check your connection and try again.";
  for (const raw of [
    'Could not reach the account server. Start it with npm run server, or set EXPO_PUBLIC_API_URL.',
    'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY.',
    'Invalid API key',
    'Failed to fetch',
    'Network request failed',
    'Load failed',
  ]) {
    assert.equal(friendlyAccountError(new Error(raw)), unreachable, raw);
  }
});
