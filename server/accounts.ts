import bcrypt from 'bcryptjs';
import { createHash, randomBytes, randomUUID } from 'node:crypto';

import { createAccountFieldParsers, MAX_FAVORITES } from '../src/lib/auth/account-fields.ts';
import type { FavoriteItem, UserProfile } from '../src/types/index.ts';
import type { AccountStore } from './store.ts';
import type { Database, UserRecord } from './types.ts';

export class AccountError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'AccountError';
    this.status = status;
  }
}

type AuthResult = {
  token: string;
  user: UserProfile;
};

type ToggleResult = {
  favorites: FavoriteItem[];
  favorited: boolean;
};

export type AccountService = {
  signUp(input: unknown): Promise<AuthResult>;
  signIn(input: unknown): Promise<AuthResult>;
  session(token: string): Promise<UserProfile>;
  signOut(token: string): Promise<void>;
  updateProfile(token: string, input: unknown): Promise<UserProfile>;
  deleteAccount(token: string): Promise<void>;
  listFavorites(token: string): Promise<FavoriteItem[]>;
  toggleFavorite(token: string, input: unknown): Promise<ToggleResult>;
};

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function newToken(): string {
  return randomBytes(32).toString('base64url');
}

function publicUser(user: UserRecord): UserProfile {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    preferredCategory: user.preferredCategory,
  };
}

const { asRecord, normalizeEmail, requirePassword, requireDisplayName, parseCategory, parseFavorite } =
  createAccountFieldParsers(AccountError);

function requireUser(db: Database, token: string): UserRecord {
  if (!token) throw new AccountError('Sign in again.', 401);
  const session = db.sessions.find((item) => item.tokenHash === hashToken(token));
  if (!session) throw new AccountError('Sign in again.', 401);
  const user = db.users.find((item) => item.id === session.userId);
  if (!user) throw new AccountError('Sign in again.', 401);
  return user;
}

function issueSession(db: Database, userId: string): string {
  const token = newToken();
  db.sessions.push({
    tokenHash: hashToken(token),
    userId,
    createdAt: new Date().toISOString(),
  });
  return token;
}

export async function createAccountService(
  store: AccountStore,
  options?: { bcryptRounds?: number },
): Promise<AccountService> {
  const rounds = options?.bcryptRounds ?? 10;
  const dummyHash = await bcrypt.hash('not-a-user-password', rounds);

  return {
    async signUp(input) {
      const body = asRecord(input);
      const email = normalizeEmail(body.email);
      const password = requirePassword(body.password);
      const displayName = requireDisplayName(body.displayName);
      const preferredCategory = parseCategory(body.preferredCategory, 'both');
      const passwordHash = await bcrypt.hash(password, rounds);
      const user: UserRecord = {
        id: randomUUID(),
        email,
        displayName,
        preferredCategory,
        passwordHash,
        createdAt: new Date().toISOString(),
      };
      return store.update((db) => {
        if (db.users.some((item) => item.email === email)) {
          throw new AccountError('An account with that email already exists.', 409);
        }
        db.users.push(user);
        db.favorites[user.id] = [];
        const token = issueSession(db, user.id);
        return { token, user: publicUser(user) };
      });
    },

    async signIn(input) {
      const body = asRecord(input);
      const email = normalizeEmail(body.email);
      const password = requirePassword(body.password);
      const snapshot = await store.read();
      const existing = snapshot.users.find((item) => item.email === email);
      const matches = await bcrypt.compare(password, existing?.passwordHash ?? dummyHash);
      if (!existing || !matches) {
        throw new AccountError('Incorrect email or password.', 401);
      }
      return store.update((db) => {
        const user = db.users.find((item) => item.id === existing.id);
        if (!user) throw new AccountError('Incorrect email or password.', 401);
        const token = issueSession(db, user.id);
        return { token, user: publicUser(user) };
      });
    },

    async session(token) {
      const db = await store.read();
      return publicUser(requireUser(db, token));
    },

    async signOut(token) {
      if (!token) throw new AccountError('Sign in again.', 401);
      const tokenHash = hashToken(token);
      await store.update((db) => {
        db.sessions = db.sessions.filter((item) => item.tokenHash !== tokenHash);
      });
    },

    async updateProfile(token, input) {
      const body = asRecord(input);
      return store.update((db) => {
        const user = requireUser(db, token);
        if (body.displayName !== undefined) user.displayName = requireDisplayName(body.displayName);
        if (body.preferredCategory !== undefined) {
          user.preferredCategory = parseCategory(body.preferredCategory, user.preferredCategory);
        }
        return publicUser(user);
      });
    },

    async deleteAccount(token) {
      await store.update((db) => {
        const user = requireUser(db, token);
        db.users = db.users.filter((item) => item.id !== user.id);
        db.sessions = db.sessions.filter((item) => item.userId !== user.id);
        delete db.favorites[user.id];
      });
    },

    async listFavorites(token) {
      const db = await store.read();
      const user = requireUser(db, token);
      return (db.favorites[user.id] ?? []).map((item) => ({ ...item }));
    },

    async toggleFavorite(token, input) {
      const draft = parseFavorite(input);
      return store.update((db) => {
        const user = requireUser(db, token);
        const current = db.favorites[user.id] ?? [];
        const index = current.findIndex((item) => item.id === draft.id);
        if (index >= 0) {
          const next = current.filter((item) => item.id !== draft.id);
          db.favorites[user.id] = next;
          return { favorites: next.map((item) => ({ ...item })), favorited: false };
        }
        if (current.length >= MAX_FAVORITES) {
          throw new AccountError('Favorites list is full.', 400);
        }
        const saved: FavoriteItem = { ...draft, savedAt: new Date().toISOString() };
        const next = [saved, ...current];
        db.favorites[user.id] = next;
        return { favorites: next.map((item) => ({ ...item })), favorited: true };
      });
    },
  };
}
