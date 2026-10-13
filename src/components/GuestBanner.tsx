import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/context/ThemeContext';
import { radii, spacing } from '@/theme';

export function GuestBanner() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const router = useRouter();

  if (user) return null;

  return (
    <View style={[styles.wrap, { backgroundColor: colors.cardMuted, borderColor: colors.border }]}>
      <Text style={[styles.body, { color: colors.text }]} numberOfLines={1}>
        Browsing as a guest.
      </Text>
      <Pressable
        onPress={() => router.push('/auth/sign-up')}
        style={[styles.cta, { backgroundColor: colors.tint }]}
        accessibilityRole="button"
        accessibilityLabel="Create an account"
      >
        <Text style={[styles.ctaText, { color: colors.headerText }]}>Join</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
    minHeight: 44,
  },
  body: { flex: 1, fontSize: 15, fontWeight: '600' },
  cta: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { fontWeight: '700', fontSize: 15 },
});
