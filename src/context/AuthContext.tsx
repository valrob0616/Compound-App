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
import type { AuthMode, CategoryId, PreferredCategory, UserProfile } from '@/types';

type AuthContextValue = {
  user: UserProfile | null;
  loading: boolean;
  busy: boolean;
  authMode: AuthMode;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: {
    email: string;
    password: string;
    displayName: string;
    preferredCategory?: PreferredCategory;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<UserProfile, 'displayName' | 'preferredCategory'>>) => Promise<void>;
  deleteAccount: () => Promise<{ cloudDeletionPending: boolean }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const authMode = auth.getAuthMode();

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
      authMode,
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
          setUser(await auth.updateProfile(user, patch));
        }),
      deleteAccount: () =>
        wrap(async () => {
          if (!user) throw new Error('Sign in to delete your account.');
          const result = await auth.deleteAccount(user);
          setUser(null);
          return result;
        }),
    }),
    [authMode, busy, loading, user, wrap],
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
  favoriteIds: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => Promise<boolean>;
};

const AppPrefsContext = createContext<AppPrefsValue | null>(null);

export function AppPrefsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [category, setCategoryState] = useState<CategoryId>('homesteading');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

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
    (async () => {
      if (!user) {
        setFavoriteIds([]);
        return;
      }
      const ids = await getJson<string[]>(storageKeys.favorites(user.id), []);
      if (!cancelled) setFavoriteIds(ids);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const setCategory = useCallback((next: CategoryId) => {
    setCategoryState(next);
    void setJson(storageKeys.lastCategory, next);
  }, []);

  const toggleFavorite = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) return false;
      const next = favoriteIds.includes(id) ? favoriteIds.filter((item) => item !== id) : [...favoriteIds, id];
      setFavoriteIds(next);
      await setJson(storageKeys.favorites(user.id), next);
      return true;
    },
    [favoriteIds, user],
  );

  const value = useMemo<AppPrefsValue>(
    () => ({
      category,
      setCategory,
      favoriteIds,
      isFavorite: (id) => favoriteIds.includes(id),
      toggleFavorite,
    }),
    [category, favoriteIds, setCategory, toggleFavorite],
  );

  return <AppPrefsContext.Provider value={value}>{children}</AppPrefsContext.Provider>;
}

export function useAppPrefs(): AppPrefsValue {
  const ctx = useContext(AppPrefsContext);
  if (!ctx) throw new Error('useAppPrefs must be used within AppPrefsProvider');
  return ctx;
}
