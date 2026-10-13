import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/context/ThemeContext';
import {
  YOUTUBE_THIRD_PARTY_DISCLAIMER,
  YOUTUBE_THIRD_PARTY_DISCLAIMER_TITLE,
} from '@/content/youtube';
import { radii, spacing } from '@/theme';

type Props = {
  compact?: boolean;
  /** One line on the list, with the full LFH Inc disclaimer one tap away. */
  collapsible?: boolean;
};

const ONE_LINE = 'These clips are not owned or created by LFH Inc.';

export function VideoDisclaimer({ compact = false, collapsible = false }: Props) {
  const { colors } = useAppTheme();
  const [open, setOpen] = useState(false);
  const showFull = !collapsible || open;

  if (!showFull) {
    return (
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityState={{ expanded: false }}
        accessibilityLabel={`${ONE_LINE} Show the full note.`}
        style={[styles.line, { backgroundColor: colors.cardMuted, borderColor: colors.accent }]}
      >
        <Ionicons name="information-circle" size={18} color={colors.accent} />
        <Text style={[styles.lineText, { color: colors.text }]} numberOfLines={1}>
          {ONE_LINE}
        </Text>
        <Text style={[styles.details, { color: colors.tint }]}>Details</Text>
      </Pressable>
    );
  }

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
      <Ionicons name="information-circle" size={compact ? 20 : 22} color={colors.accent} />
      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.text }]}>{YOUTUBE_THIRD_PARTY_DISCLAIMER_TITLE}</Text>
        <Text style={[styles.body, compact ? styles.bodyCompact : null, { color: colors.text }]}>
          {YOUTUBE_THIRD_PARTY_DISCLAIMER}
        </Text>
        {collapsible ? (
          <Pressable
            onPress={() => setOpen(false)}
            accessibilityRole="button"
            accessibilityState={{ expanded: true }}
            accessibilityLabel="Hide the full YouTube note"
            style={styles.hide}
          >
            <Text style={[styles.details, { color: colors.tint }]}>Hide</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  lineText: { flex: 1, fontSize: 13, fontWeight: '600' },
  details: { fontSize: 14, fontWeight: '700' },
  hide: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
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
