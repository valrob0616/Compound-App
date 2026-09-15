import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useAppTheme } from '@/context/ThemeContext';
import { spacing } from '@/theme';

export function LegalLinks() {
  const { colors } = useAppTheme();
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => router.push('/legal/privacy')}
        accessibilityRole="link"
        accessibilityLabel="Privacy Policy"
        style={styles.hit}
      >
        <Text style={[styles.link, { color: colors.tint }]}>Privacy Policy</Text>
      </Pressable>
      <Text style={{ color: colors.textMuted }}> · </Text>
      <Pressable
        onPress={() => router.push('/legal/terms')}
        accessibilityRole="link"
        accessibilityLabel="Terms of Use"
        style={styles.hit}
      >
        <Text style={[styles.link, { color: colors.tint }]}>Terms of Use</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  hit: { minHeight: 44, justifyContent: 'center' },
  link: { fontSize: 15, fontWeight: '700' },
});
