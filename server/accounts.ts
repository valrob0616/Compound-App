import bcrypt from 'bcryptjs';
import { createHash, randomBytes, randomUUID } from 'node:crypto';

import type { FavoriteDraft, FavoriteItem, PreferredCategory, UserProfile } from '../src/types/index.ts';
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

const CATEGORIES = new Set<PreferredCategory>(['homesteading', 'family-compounds', 'both']);
const KINDS = new Set<FavoriteDraft['kind']>(['news', 'video', 'learn']);
const MAX_FAVORITES = 200;

export type AuthResult = {
  token: string;
  user: UserProfile;
};

export type ToggleResult = {
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

function asRecord(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new AccountError('Expected a JSON object.', 400);
  }
  return input as Record<string, unknown>;
}

function normalizeEmail(value: unknown): string {
  if (typeof value !== 'string') throw new AccountError('Enter a valid email.', 400);
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AccountError('Enter a valid email.', 400);
  }
  return email;
}

function requirePassword(value: unknown): string {
  if (typeof value !== 'string') throw new AccountError('Use at least 6 characters.', 400);
  if (value.length < 6) throw new AccountError('Use at least 6 characters.', 400);
  if (value.length > 128) throw new AccountError('Password is too long.', 400);
  return value;
}

function requireDisplayName(value: unknown): string {
  if (typeof value !== 'string') throw new AccountError('Choose a display name.', 400);
  const name = value.replace(/[\u0000-\u001F]/g, '').trim();
  if (!name) throw new AccountError('Choose a display name.', 400);
  if (name.length > 80) throw new AccountError('Display name is too long.', 400);
  return name;
}

function parseCategory(value: unknown, fallback: PreferredCategory): PreferredCategory {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !CATEGORIES.has(value as PreferredCategory)) {
    throw new AccountError('Choose a preferred category.', 400);
  }
  return value as PreferredCategory;
}

function requireUser(db: Database, token: string): UserRecord {
  if (!token) throw new AccountError('Sign in again.', 401);
  const session = db.sessions.find((item) => item.tokenHash === hashToken(token));
  if (!session) throw new AccountError('Sign in again.', 401);
  const user = db.users.find((item) => item.id === session.userId);
  if (!user) throw new AccountError('Sign in again.', 401);
  return user;
}

function cleanLine(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const text = value.replace(/[\u0000-\u001F]/g, '').trim();
  if (!text || text.length > max) return null;
  return text;
}

function parseFavorite(input: unknown): Omit<FavoriteItem, 'savedAt'> {
  const body = asRecord(input);
  const id = cleanLine(body.id, 180);
  if (!id) throw new AccountError('That favorite is missing an id.', 400);
  if (typeof body.kind !== 'string' || !KINDS.has(body.kind as FavoriteDraft['kind'])) {
    throw new AccountError('That favorite has an unknown kind.', 400);
  }
  const kind = body.kind as FavoriteDraft['kind'];
  const title = cleanLine(body.title, 200);
  if (!title) throw new AccountError('That favorite needs a title.', 400);
  const subtitle = body.subtitle === undefined ? undefined : cleanLine(body.subtitle, 200) ?? undefined;
  let url: string | undefined;
  if (body.url !== undefined && body.url !== '') {
    if (typeof body.url !== 'string' || body.url.length > 2000 || !/^https?:\/\//i.test(body.url)) {
      throw new AccountError('A news favorite needs an http(s) link.', 400);
    }
    url = body.url;
  }
  let youtubeId: string | undefined;
  if (body.youtubeId !== undefined && body.youtubeId !== '') {
    if (typeof body.youtubeId !== 'string' || !/^[\w-]{6,20}$/.test(body.youtubeId)) {
      throw new AccountError('A video favorite needs a YouTube id.', 400);
    }
    youtubeId = body.youtubeId;
  }
  if (kind === 'news' && !url) throw new AccountError('A news favorite needs a link.', 400);
  if (kind === 'video' && !youtubeId) throw new AccountError('A video favorite needs a YouTube id.', 400);
  return { id, kind, title, subtitle, url, youtubeId };
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
