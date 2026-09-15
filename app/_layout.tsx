import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { AppPrefsProvider, AuthProvider, useAuth } from '@/context/AuthContext';
import { AppThemeProvider, useAppTheme } from '@/context/ThemeContext';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

function BootGate({ children }: { children: ReactNode }) {
  const { loading } = useAuth();
  const { colors } = useAppTheme();
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.tint} />
      </View>
    );
  }
  return <>{children}</>;
}

function RootNav() {
  const { scheme, colors } = useAppTheme();
  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'light'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.header },
          headerTintColor: colors.headerText,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="article/[id]" options={{ title: 'Article' }} />
        <Stack.Screen name="video/[id]" options={{ title: 'Video' }} />
        <Stack.Screen name="product/[id]" options={{ title: 'Product' }} />
        <Stack.Screen name="auth/sign-in" options={{ title: 'Sign in', presentation: 'modal' }} />
        <Stack.Screen name="auth/sign-up" options={{ title: 'Create account', presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <AppPrefsProvider>
          <BootGate>
            <RootNav />
          </BootGate>
        </AppPrefsProvider>
      </AuthProvider>
    </AppThemeProvider>
  );
}
