import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from 'expo-router';
import { createContext, useContext, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { darkColors, lightColors, type ThemeColors } from '@/theme/colors';

type Scheme = 'light' | 'dark';

type ThemeContextValue = {
  scheme: Scheme;
  colors: ThemeColors;
};

const ThemeContext = createContext<ThemeContextValue>({
  scheme: 'light',
  colors: lightColors,
});

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const raw = useColorScheme();
  const scheme: Scheme = raw === 'dark' ? 'dark' : 'light';
  const colors = scheme === 'dark' ? darkColors : lightColors;
  const navTheme = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const themedNav = {
    ...navTheme,
    colors: {
      ...navTheme.colors,
      primary: colors.tint,
      background: colors.background,
      card: colors.tabBar,
      text: colors.text,
      border: colors.border,
      notification: colors.accent,
    },
  };

  return (
    <ThemeContext.Provider value={{ scheme, colors }}>
      <NavThemeProvider value={themedNav}>{children}</NavThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
