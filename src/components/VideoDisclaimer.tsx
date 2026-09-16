import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/context/ThemeContext';
import {
  YOUTUBE_THIRD_PARTY_DISCLAIMER,
  YOUTUBE_THIRD_PARTY_DISCLAIMER_TITLE,
} from '@/content/youtube';
import { radii, spacing } from '@/theme';

type Props = {
  compact?: boolean;
};

export function VideoDisclaimer({ compact = false }: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.wrap,
        compact ? styles.wrapCompact : null,
        { backgroundColor: colors.cardMuted, borderColor: colors.accent },
      ]}
      accessibilityRole="summary"
      accessibilityLabel={`${YOUTUBE_THIRD_PARTY_DISCLAIMER_TITLE}. ${YOUTUBE_THIRD_PARTY_DISCLAIMER}`}
    >
      <Ionicons name="information-circle" size={compact ? 20 : 24} color={colors.accent} />
      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.text }]}>{YOUTUBE_THIRD_PARTY_DISCLAIMER_TITLE}</Text>
        <Text style={[styles.body, compact ? styles.bodyCompact : null, { color: colors.text }]}>
          {YOUTUBE_THIRD_PARTY_DISCLAIMER}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 2,
    marginBottom: spacing.md,
  },
  wrapCompact: {
    padding: spacing.sm,
    marginBottom: 0,
  },
  copy: { flex: 1 },
  title: {
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  body: { fontSize: 13, lineHeight: 19 },
  bodyCompact: { fontSize: 12, lineHeight: 17 },
});
