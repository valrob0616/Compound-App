import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';

import { AuthModePill, PrimaryButton, ScreenTitle, TextField } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/context/ThemeContext';
import { isValidEmail } from '@/lib/format';
import { spacing } from '@/theme';

export default function SignInScreen() {
  const { colors } = useAppTheme();
  const { signIn, busy, authMode } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const onSubmit = async () => {
    const next = {
      email: isValidEmail(email) ? undefined : 'Enter a valid email.',
      password: password.length >= 6 ? undefined : 'Password must be at least 6 characters.',
    };
    setErrors(next);
    if (next.email || next.password) return;
    try {
      await signIn(email, password);
      router.replace('/account');
    } catch (err) {
      Alert.alert('Could not sign in', err instanceof Error ? err.message : 'Try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenTitle title="Welcome back" subtitle="Sign in to restore favorites and your preferred category." />
        <AuthModePill mode={authMode} />
        <View style={{ height: spacing.md }} />
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
        <Text style={[styles.switch, { color: colors.textMuted }]}>
          New here?{' '}
          <Link href="/auth/sign-up" style={{ color: colors.tint, fontWeight: '700' }}>
            Create an account
          </Link>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: 48 },
  switch: { marginTop: spacing.lg, fontSize: 14 },
});
