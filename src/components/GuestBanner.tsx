import { Ionicons } from '@expo/vector-icons';
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
      <Ionicons name="leaf-outline" size={20} color={colors.tint} />
      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.text }]}>Browsing as a guest</Text>
        <Text style={[styles.body, { color: colors.textMuted }]}>
          Create a free account to save favorites and remember your preferred category.
        </Text>
      </View>
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
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  copy: { flex: 1 },
  title: { fontWeight: '700', fontSize: 14, marginBottom: 2 },
  body: { fontSize: 12, lineHeight: 16 },
  cta: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    minHeight: 36,
    justifyContent: 'center',
  },
  ctaText: { fontWeight: '700', fontSize: 13 },
});
