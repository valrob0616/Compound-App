import * as Crypto from 'expo-crypto';

import type { PreferredCategory, UserProfile } from '@/types';
import { getJson, getSecureItem, setJson, setSecureItem, deleteSecureItem, storageKeys } from '@/lib/storage';

type DemoUser = UserProfile & {
  passwordSalt: string;
  passwordHash: string;
};

type Session = { userId: string };

async function hashPassword(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}

async function loadUsers(): Promise<DemoUser[]> {
  return getJson<DemoUser[]>(storageKeys.demoUsers, []);
}

async function saveUsers(users: DemoUser[]): Promise<void> {
  await setJson(storageKeys.demoUsers, users);
}

function toProfile(user: DemoUser): UserProfile {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    preferredCategory: user.preferredCategory,
  };
}

export async function demoGetSession(): Promise<UserProfile | null> {
  const raw = await getSecureItem(storageKeys.session);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as Session;
    const users = await loadUsers();
    const user = users.find((item) => item.id === session.userId);
    return user ? toProfile(user) : null;
  } catch {
    return null;
  }
}

export async function demoSignUp(input: {
  email: string;
  password: string;
  displayName: string;
  preferredCategory?: PreferredCategory;
}): Promise<UserProfile> {
  const email = input.email.trim().toLowerCase();
  const users = await loadUsers();
  if (users.some((user) => user.email === email)) {
    throw new Error('An account with that email already exists.');
  }
  const salt = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${Date.now()}:${email}:${Math.random()}`,
  );
  const passwordHash = await hashPassword(input.password, salt);
  const user: DemoUser = {
    id: `demo_${salt.slice(0, 12)}`,
    email,
    displayName: input.displayName.trim() || email.split('@')[0],
    preferredCategory: input.preferredCategory ?? 'both',
    passwordSalt: salt,
    passwordHash,
  };
  users.push(user);
  await saveUsers(users);
  await setSecureItem(storageKeys.session, JSON.stringify({ userId: user.id } satisfies Session));
  return toProfile(user);
}

export async function demoSignIn(email: string, password: string): Promise<UserProfile> {
  const users = await loadUsers();
  const user = users.find((item) => item.email === email.trim().toLowerCase());
  if (!user) {
    throw new Error('No account found for that email.');
  }
  const hash = await hashPassword(password, user.passwordSalt);
  if (hash !== user.passwordHash) {
    throw new Error('Incorrect password.');
  }
  await setSecureItem(storageKeys.session, JSON.stringify({ userId: user.id } satisfies Session));
  return toProfile(user);
}

export async function demoSignOut(): Promise<void> {
  await deleteSecureItem(storageKeys.session);
}

export async function demoUpdateProfile(
  userId: string,
  patch: Partial<Pick<UserProfile, 'displayName' | 'preferredCategory'>>,
): Promise<UserProfile> {
  const users = await loadUsers();
  const index = users.findIndex((item) => item.id === userId);
  if (index < 0) throw new Error('Account not found.');
  const next = { ...users[index], ...patch };
  users[index] = next;
  await saveUsers(users);
  return toProfile(next);
}
