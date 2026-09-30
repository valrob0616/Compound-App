import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import * as auth from '@/lib/auth';
import { getJson, setJson, storageKeys } from '@/lib/storage';
import type { CategoryId, FavoriteDraft, FavoriteItem, PreferredCategory, UserProfile } from '@/types';

type AuthContextValue = {
  user: UserProfile | null;
  loading: boolean;
  busy: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: {
    email: string;
    password: string;
    displayName: string;
    preferredCategory?: PreferredCategory;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<UserProfile, 'displayName' | 'preferredCategory'>>) => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const restored = await auth.restoreSession();
        if (!cancelled) setUser(restored);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const wrap = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    setBusy(true);
    try {
      return await fn();
    } finally {
      setBusy(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      busy,
      signIn: (email, password) =>
        wrap(async () => {
          setUser(await auth.signIn(email, password));
        }),
      signUp: (input) =>
        wrap(async () => {
          setUser(await auth.signUp(input));
        }),
      signOut: () =>
        wrap(async () => {
          await auth.signOut();
          setUser(null);
        }),
      updateProfile: (patch) =>
        wrap(async () => {
          if (!user) throw new Error('Sign in to update your profile.');
          setUser(await auth.updateProfile(patch));
        }),
      deleteAccount: () =>
        wrap(async () => {
          if (!user) throw new Error('Sign in to delete your account.');
          await auth.deleteAccount();
          setUser(null);
        }),
    }),
    [busy, loading, user, wrap],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

type AppPrefsValue = {
  category: CategoryId;
  setCategory: (category: CategoryId) => void;
  favorites: FavoriteItem[];
  favoritesNote: string | null;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (draft: FavoriteDraft) => Promise<boolean>;
};

const AppPrefsContext = createContext<AppPrefsValue | null>(null);

export function AppPrefsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [category, setCategoryState] = useState<CategoryId>('homesteading');
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [favoritesNote, setFavoritesNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await getJson<CategoryId | null>(storageKeys.lastCategory, null);
      if (cancelled) return;
      if (user?.preferredCategory === 'homesteading' || user?.preferredCategory === 'family-compounds') {
        setCategoryState(user.preferredCategory);
      } else if (stored === 'homesteading' || stored === 'family-compounds') {
        setCategoryState(stored);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.preferredCategory]);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setFavorites([]);
      setFavoritesNote(null);
      return;
    }
    setFavoritesNote(null);
    void auth
      .loadFavorites()
      .then((items) => {
        if (!cancelled) setFavorites(items);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setFavorites([]);
          setFavoritesNote(err instanceof Error ? err.message : 'Could not load favorites.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const setCategory = useCallback((next: CategoryId) => {
    setCategoryState(next);
    void setJson(storageKeys.lastCategory, next);
  }, []);

  const toggleFavorite = useCallback(
    async (draft: FavoriteDraft): Promise<boolean> => {
      if (!user) return false;
      const next = await auth.toggleFavorite(draft);
      setFavorites(next);
      setFavoritesNote(null);
      return true;
    },
    [user],
  );

  const value = useMemo<AppPrefsValue>(
    () => ({
      category,
      setCategory,
      favorites,
      favoritesNote,
      isFavorite: (id) => favorites.some((item) => item.id === id),
      toggleFavorite,
    }),
    [category, favorites, favoritesNote, setCategory, toggleFavorite],
  );

  return <AppPrefsContext.Provider value={value}>{children}</AppPrefsContext.Provider>;
}

export function useAppPrefs(): AppPrefsValue {
  const ctx = useContext(AppPrefsContext);
  if (!ctx) throw new Error('useAppPrefs must be used within AppPrefsProvider');
  return ctx;
}
