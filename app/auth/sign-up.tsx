import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';

import { AuthModePill, PrimaryButton, ScreenTitle, TextField } from '@/components/ui';
import { LegalLinks } from '@/components/LegalLinks';
import { PREFERRED_LABELS } from '@/constants/config';
import { useAppPrefs, useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/context/ThemeContext';
import { isValidEmail } from '@/lib/format';
import { radii, spacing } from '@/theme';
import type { PreferredCategory } from '@/types';

const PREFERRED: PreferredCategory[] = ['homesteading', 'family-compounds', 'both'];

export default function SignUpScreen() {
  const { colors } = useAppTheme();
  const { signUp, busy, authMode } = useAuth();
  const { setCategory } = useAppPrefs();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredCategory, setPreferredCategory] = useState<PreferredCategory>('both');
  const [errors, setErrors] = useState<{ email?: string; password?: string; displayName?: string }>({});

  const onSubmit = async () => {
    const next = {
      displayName: displayName.trim() ? undefined : 'Choose a display name.',
      email: isValidEmail(email) ? undefined : 'Enter a valid email.',
      password: password.length >= 6 ? undefined : 'Use at least 6 characters.',
    };
    setErrors(next);
    if (next.displayName || next.email || next.password) return;
    try {
      await signUp({ email, password, displayName, preferredCategory });
      if (preferredCategory !== 'both') setCategory(preferredCategory);
      router.replace('/account');
    } catch (err) {
      Alert.alert('Could not create account', err instanceof Error ? err.message : 'Try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenTitle
          title="Create an account"
          subtitle="Save a preferred feed and favorites. You can still browse as a guest anytime."
        />
        <AuthModePill mode={authMode} />
        <View style={{ height: spacing.md }} />
        <TextField
          label="Display name"
          value={displayName}
          onChangeText={setDisplayName}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          error={errors.displayName}
        />
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          error={errors.email}
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          error={errors.password}
        />
        <Text style={[styles.label, { color: colors.textMuted }]}>Preferred category</Text>
        <View style={styles.row}>
          {PREFERRED.map((option) => {
            const active = preferredCategory === option;
            return (
              <Pressable
                key={option}
                onPress={() => setPreferredCategory(option)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[
                  styles.chip,
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
        <PrimaryButton label="Create account" loading={busy} onPress={() => void onSubmit()} />
        <Text style={[styles.switch, { color: colors.textMuted }]}>
          By creating an account you agree to the Terms of Use. Read the Privacy Policy for how we
          handle email, preferences, and favorites.
        </Text>
        <LegalLinks />
        <Text style={[styles.switch, { color: colors.textMuted }]}>
          Already have an account?{' '}
          <Link href="/auth/sign-in" style={{ color: colors.tint, fontWeight: '700' }}>
            Sign in
          </Link>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: 48 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  chip: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
  },
  switch: { marginTop: spacing.lg, fontSize: 14 },
});
