import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AuthModePill, PrimaryButton, ScreenTitle, TextField } from '@/components/ui';
import { PREFERRED_LABELS } from '@/constants/config';
import { useAppPrefs, useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/context/ThemeContext';
import { initials } from '@/lib/format';
import { radii, spacing } from '@/theme';
import { serif } from '@/theme/typography';
import type { PreferredCategory } from '@/types';

const PREFERRED: PreferredCategory[] = ['homesteading', 'family-compounds', 'both'];

export default function AccountScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { user, authMode, busy, signOut, updateProfile } = useAuth();
  const { setCategory } = useAppPrefs();
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (user?.displayName) setDisplayName(user.displayName);
  }, [user?.displayName]);

  if (!user) {
    return (
      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}>
        <ScreenTitle
          title="Your place at the table"
          subtitle="Browse feeds and the store as a guest. Create an account to save a preferred category and favorites on this device."
        />
        <AuthModePill mode={authMode} />
        <View style={{ height: spacing.md }} />
        <PrimaryButton label="Create account" onPress={() => router.push('/auth/sign-up')} />
        <View style={{ height: spacing.sm }} />
        <PrimaryButton variant="secondary" label="Sign in" onPress={() => router.push('/auth/sign-in')} />
        {authMode === 'demo' ? (
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            Demo mode stores accounts in local secure storage. No cloud account is created until you add
            Supabase keys.
          </Text>
        ) : (
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            This build is using live Supabase Auth.
          </Text>
        )}
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
      <AuthModePill mode={authMode} />

      <View style={{ height: spacing.lg }} />
      <TextField
        label="Display name"
        value={displayName}
        onChangeText={setDisplayName}
        autoCapitalize="words"
      />

      <Text style={[styles.label, { color: colors.textMuted }]}>Preferred category</Text>
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
              Alert.alert('Could not save', err instanceof Error ? err.message : 'Try again.');
            }
          })();
        }}
      />
      {status ? <Text style={[styles.status, { color: colors.success }]}>{status}</Text> : null}

      <View style={{ height: spacing.lg }} />
      <PrimaryButton
        variant="secondary"
        label="Sign out"
        onPress={() => {
          Alert.alert('Sign out?', 'You can still browse as a guest.', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Sign out',
              style: 'destructive',
              onPress: () => void signOut(),
            },
          ]);
        }}
      />
      <Text style={[styles.privacy, { color: colors.textMuted }]}>
        We store your email, display name, and preferred category. In demo mode that stays on this
        device. With Supabase, it is stored in your Auth user metadata. See the README privacy notes.
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
  privacy: { marginTop: spacing.lg, fontSize: 12, lineHeight: 18 },
});
