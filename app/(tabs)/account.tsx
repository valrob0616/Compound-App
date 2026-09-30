import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { FavoriteButton } from '@/components/FavoriteButton';
import { LegalLinks } from '@/components/LegalLinks';
import { AuthModePill, PrimaryButton, ScreenTitle, TextField } from '@/components/ui';
import { PREFERRED_LABELS, privacyContactEmail } from '@/constants/config';
import { useAppPrefs, useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/context/ThemeContext';
import { confirmAction, showMessage } from '@/lib/dialog';
import { initials } from '@/lib/format';
import { radii, spacing } from '@/theme';
import { serif } from '@/theme/typography';
import type { FavoriteItem, FavoriteKind, PreferredCategory } from '@/types';

const PREFERRED: PreferredCategory[] = ['homesteading', 'family-compounds', 'both'];

const KIND_LABEL: Record<FavoriteKind, string> = {
  news: 'Article',
  video: 'Video',
  learn: 'Learn',
};

export default function AccountScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { user, busy, signOut, updateProfile, deleteAccount } = useAuth();
  const { setCategory, favorites, favoritesNote, toggleFavorite } = useAppPrefs();
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (user?.displayName) setDisplayName(user.displayName);
  }, [user?.displayName]);

  const openFavorite = (item: FavoriteItem) => {
    if (item.kind === 'news' && item.url) {
      router.push({ pathname: '/article/[id]', params: { id: item.id, url: item.url, title: item.title } });
      return;
    }
    if (item.kind === 'video' && item.youtubeId) {
      router.push({
        pathname: '/video/[id]',
        params: { id: item.id, youtubeId: item.youtubeId, title: item.title },
      });
      return;
    }
    if (item.kind === 'learn') {
      router.push({ pathname: '/learn', params: { scenario: item.id } });
    }
  };

  if (!user) {
    return (
      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}>
        <ScreenTitle
          title="Your place at the table"
          subtitle="Browse as a guest. Create an account to save your name and favorites on the account server — not on this phone."
        />
        <AuthModePill />
        <View style={{ height: spacing.md }} />
        <PrimaryButton label="Create account" onPress={() => router.push('/auth/sign-up')} />
        <View style={{ height: spacing.sm }} />
        <PrimaryButton variant="secondary" label="Sign in" onPress={() => router.push('/auth/sign-in')} />
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          Name, email, and password are stored on the account server. This device keeps a sign-in token only, so
          favorites come back when you sign in again.
        </Text>
        <LegalLinks />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}>
      <View style={styles.hero}>
        <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
          <Text style={[styles.avatarText, { color: colors.headerText }]}>{initials(user.displayName)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: colors.text }]}>{user.displayName}</Text>
          <Text style={[styles.email, { color: colors.textMuted }]}>{user.email}</Text>
        </View>
      </View>
      <AuthModePill />

      <View style={{ height: spacing.lg }} />
      <TextField
        label="Display name"
        value={displayName}
        onChangeText={setDisplayName}
        autoCapitalize="words"
      />

      <Text style={[styles.label, { color: colors.textMuted }]}>Preferred category</Text>
      <Text style={[styles.prefHint, { color: colors.textMuted }]}>
        Used for Featured Videos. News stays on Family Compound RSS.
      </Text>
      <View style={styles.prefRow}>
        {PREFERRED.map((option) => {
          const active = (user.preferredCategory ?? 'both') === option;
          return (
            <Pressable
              key={option}
              onPress={() => {
                void (async () => {
                  await updateProfile({ preferredCategory: option });
                  if (option !== 'both') setCategory(option);
                })();
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[
                styles.prefChip,
                {
                  backgroundColor: active ? colors.chipActive : colors.cardMuted,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={{ color: active ? colors.chipActiveText : colors.text, fontWeight: '700', fontSize: 13 }}>
                {PREFERRED_LABELS[option]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <PrimaryButton
        label="Save profile"
        loading={busy}
        onPress={() => {
          void (async () => {
            try {
              await updateProfile({ displayName: displayName.trim() || user.displayName });
              setStatus('Profile saved.');
            } catch (err) {
              showMessage('Could not save', err instanceof Error ? err.message : 'Try again.');
            }
          })();
        }}
      />
      {status ? <Text style={[styles.status, { color: colors.success }]}>{status}</Text> : null}

      <View style={{ height: spacing.lg }} />
      <Text style={[styles.label, { color: colors.textMuted }]}>Favorites</Text>
      <Text style={[styles.prefHint, { color: colors.textMuted }]}>
        Saved with your account. Sign in on any device to pull them up again.
      </Text>
      {favoritesNote ? <Text style={[styles.favoritesNote, { color: colors.danger }]}>{favoritesNote}</Text> : null}
      {favorites.length === 0 ? (
        <Text style={[styles.emptyFavorites, { color: colors.textMuted }]}>
          No favorites yet. Bookmark a news article, a featured video, or a Compound Scout look.
        </Text>
      ) : (
        favorites.map((item) => (
          <View
            key={item.id}
            style={[styles.favoriteRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open ${KIND_LABEL[item.kind]} ${item.title}`}
              onPress={() => openFavorite(item)}
              style={styles.favoriteCopy}
            >
              <Text style={[styles.favoriteKind, { color: colors.accent }]}>{KIND_LABEL[item.kind]}</Text>
              <Text style={[styles.favoriteTitle, { color: colors.text }]}>{item.title}</Text>
              {item.subtitle ? (
                <Text style={[styles.favoriteSubtitle, { color: colors.textMuted }]}>{item.subtitle}</Text>
              ) : null}
            </Pressable>
            <FavoriteButton
              active
              onPress={() => {
                void toggleFavorite(item).catch((err: unknown) => {
                  showMessage('Could not update favorite', err instanceof Error ? err.message : 'Try again.');
                });
              }}
            />
          </View>
        ))
      )}

      <View style={{ height: spacing.lg }} />
      <PrimaryButton
        variant="secondary"
        label="Sign out"
        onPress={() => {
          confirmAction(
            'Sign out?',
            'You can still browse as a guest. Favorites stay on your account.',
            'Sign out',
            () => void signOut(),
          );
        }}
      />
      <View style={{ height: spacing.sm }} />
      <PrimaryButton
        variant="ghost"
        label="Delete account"
        onPress={() => {
          confirmAction(
            'Delete account?',
            `This removes your account, password, and favorites from the server, and signs you out on this device. Email ${privacyContactEmail()} if you also want a copy of what was stored.`,
            'Delete',
            () => {
              void (async () => {
                try {
                  await deleteAccount();
                } catch (err) {
                  showMessage('Could not delete', err instanceof Error ? err.message : 'Try again.');
                }
              })();
            },
          );
        }}
      />
      <LegalLinks />
      <Text style={[styles.privacy, { color: colors.textMuted }]}>
        Your email, display name, preferred category, and favorites are stored on the account server. The
        password is stored there only as a bcrypt hash. This device keeps a sign-in token, not the password.
        Full details are in the Privacy Policy.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: 48 },
  hint: { marginTop: spacing.md, fontSize: 13, lineHeight: 18 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: serif, fontSize: 22, fontWeight: '700' },
  name: { fontFamily: serif, fontSize: 24, fontWeight: '700' },
  email: { marginTop: 4, fontSize: 14 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  prefHint: { fontSize: 13, lineHeight: 18, marginTop: -4, marginBottom: 8 },
  prefRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  prefChip: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
  },
  status: { marginTop: 8, fontSize: 13 },
  favoritesNote: { fontSize: 13, marginBottom: spacing.sm },
  emptyFavorites: { fontSize: 14, lineHeight: 20, marginBottom: spacing.sm },
  favoriteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radii.md,
    paddingLeft: spacing.md,
    paddingRight: 4,
    marginBottom: spacing.sm,
  },
  favoriteCopy: { flex: 1, paddingVertical: spacing.sm },
  favoriteKind: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  favoriteTitle: { fontFamily: serif, fontSize: 16, fontWeight: '700', marginTop: 2 },
  favoriteSubtitle: { fontSize: 13, marginTop: 2 },
  privacy: { marginTop: spacing.lg, fontSize: 12, lineHeight: 18 },
});
