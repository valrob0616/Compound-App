import type { FavoriteItem, FavoriteKind, PreferredCategory } from '../../types/index.ts';
import { isValidEmail } from '../format.ts';

/** Shared by the local account server and the Supabase account client. */
export const MAX_FAVORITES = 200;

const CATEGORIES = new Set<PreferredCategory>(['homesteading', 'family-compounds', 'both']);
const KINDS = new Set<FavoriteKind>(['news', 'video', 'learn']);

export type AccountFieldErrorCtor = new (message: string, status: number) => Error;

export function createAccountFieldParsers(ErrorType: AccountFieldErrorCtor) {
  function fail(message: string, status: number): never {
    throw new ErrorType(message, status);
  }

  function asRecord(input: unknown): Record<string, unknown> {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      fail('Expected a JSON object.', 400);
    }
    return input as Record<string, unknown>;
  }

  function normalizeEmail(value: unknown): string {
    if (typeof value !== 'string') fail('Enter a valid email.', 400);
    const email = value.trim().toLowerCase();
    if (!isValidEmail(email)) fail('Enter a valid email.', 400);
    return email;
  }

  function requirePassword(value: unknown): string {
    if (typeof value !== 'string' || value.length < 6) fail('Use at least 6 characters.', 400);
    if (value.length > 128) fail('Password is too long.', 400);
    return value;
  }

  function requireDisplayName(value: unknown): string {
    if (typeof value !== 'string') fail('Choose a display name.', 400);
    const name = value.replace(/[\u0000-\u001F]/g, '').trim();
    if (!name) fail('Choose a display name.', 400);
    if (name.length > 80) fail('Display name is too long.', 400);
    return name;
  }

  function parseCategory(value: unknown, fallback: PreferredCategory): PreferredCategory {
    if (value === undefined) return fallback;
    if (typeof value !== 'string' || !CATEGORIES.has(value as PreferredCategory)) {
      fail('Choose a preferred category.', 400);
    }
    return value as PreferredCategory;
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
    if (!id) fail('That favorite is missing an id.', 400);
    if (typeof body.kind !== 'string' || !KINDS.has(body.kind as FavoriteKind)) {
      fail('That favorite has an unknown kind.', 400);
    }
    const kind = body.kind as FavoriteKind;
    const title = cleanLine(body.title, 200);
    if (!title) fail('That favorite needs a title.', 400);
    const subtitle = body.subtitle === undefined ? undefined : (cleanLine(body.subtitle, 200) ?? undefined);
    let url: string | undefined;
    if (body.url !== undefined && body.url !== '') {
      if (typeof body.url !== 'string' || body.url.length > 2000 || !/^https?:\/\//i.test(body.url)) {
        fail('A news favorite needs an http(s) link.', 400);
      }
      url = body.url;
    }
    let youtubeId: string | undefined;
    if (body.youtubeId !== undefined && body.youtubeId !== '') {
      if (typeof body.youtubeId !== 'string' || !/^[\w-]{6,20}$/.test(body.youtubeId)) {
        fail('A video favorite needs a YouTube id.', 400);
      }
      youtubeId = body.youtubeId;
    }
    if (kind === 'news' && !url) fail('A news favorite needs a link.', 400);
    if (kind === 'video' && !youtubeId) fail('A video favorite needs a YouTube id.', 400);
    return { id, kind, title, subtitle, url, youtubeId };
  }

  return { asRecord, normalizeEmail, requirePassword, requireDisplayName, parseCategory, parseFavorite };
}
