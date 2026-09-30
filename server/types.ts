import type { FavoriteItem, PreferredCategory } from '../src/types/index.ts';

/** Full account row. The password hash never leaves the server. */
export type UserRecord = {
  id: string;
  email: string;
  displayName: string;
  preferredCategory: PreferredCategory;
  passwordHash: string;
  createdAt: string;
};

export type SessionRecord = {
  tokenHash: string;
  userId: string;
  createdAt: string;
};

export type Database = {
  users: UserRecord[];
  sessions: SessionRecord[];
  favorites: Record<string, FavoriteItem[]>;
};
