import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useAppTheme } from '@/context/ThemeContext';
import { radii, spacing } from '@/theme';

export function FeaturedVideosLink() {
  const { colors } = useAppTheme();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push('/videos')}
      accessibilityRole="link"
      accessibilityLabel="Open featured YouTube videos"
      style={[styles.wrap, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.cardMuted }]}>
        <Ionicons name="logo-youtube" size={20} color={colors.accent} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.text }]}>Featured YouTube videos</Text>
        <Text style={[styles.body, { color: colors.textMuted }]}>
          Homesteading and Family Compounds clips are on the Videos tab, separate from this news
          feed.
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Pressable>
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
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1 },
  title: { fontWeight: '700', fontSize: 14, marginBottom: 2 },
  body: { fontSize: 12, lineHeight: 16 },
});
