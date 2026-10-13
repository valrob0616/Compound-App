import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';

import { FormError, PrimaryButton, ScreenTitle, TextField } from '@/components/ui';
import { LegalLinks } from '@/components/LegalLinks';
import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/context/ThemeContext';
import { friendlyAccountError } from '@/lib/account-message';
import { isValidEmail } from '@/lib/format';
import { spacing } from '@/theme';

export default function SignInScreen() {
  const { colors } = useAppTheme();
  const { signIn, busy } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit = async () => {
    const next = {
      email: isValidEmail(email) ? undefined : 'Enter a valid email.',
      password: password.length >= 6 ? undefined : 'Password must be at least 6 characters.',
    };
    setErrors(next);
    setFormError(null);
    if (next.email || next.password) return;
    try {
      await signIn(email, password);
      router.replace('/account');
    } catch (err) {
      setFormError(friendlyAccountError(err));
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenTitle
          title="Welcome back"
          subtitle="Sign in to load favorites saved on your account. Your password is not stored on this phone."
        />
        <View style={{ height: spacing.sm }} />
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
          autoComplete="password"
          textContentType="password"
          error={errors.password}
        />
        <PrimaryButton label="Sign in" loading={busy} onPress={() => void onSubmit()} />
        <FormError message={formError} />
        <Text style={[styles.switch, { color: colors.textMuted }]}>
          New here?{' '}
          <Link href="/auth/sign-up" style={{ color: colors.tint, fontWeight: '700' }}>
            Create an account
          </Link>
        </Text>
        <LegalLinks />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: 48 },
  switch: { marginTop: spacing.lg, fontSize: 14 },
});
