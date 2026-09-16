import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FavoriteButton } from '@/components/FavoriteButton';
import { CATEGORY_LABELS } from '@/constants/config';
import { useAppTheme } from '@/context/ThemeContext';
import { formatRelativeDate } from '@/lib/format';
import { radii, spacing } from '@/theme';
import { serif } from '@/theme/typography';
import type { NewsItem } from '@/types';

type Props = {
  item: NewsItem;
  favorite: boolean;
  onOpen: () => void;
  onToggleFavorite: () => void;
};

export function NewsCard({ item, favorite, onOpen, onToggleFavorite }: Props) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`Article: ${item.title}`}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.image} accessibilityIgnoresInvertColors />
      ) : (
        <View style={[styles.imageFallback, { backgroundColor: colors.cardMuted }]}>
          <Text style={[styles.fallbackText, { color: colors.tint }]}>
            {CATEGORY_LABELS[item.category]}
          </Text>
        </View>
      )}
      <View style={styles.body}>
        <View style={styles.metaRow}>
          <Text style={[styles.kicker, { color: colors.accent }]}>{item.source}</Text>
          <FavoriteButton active={favorite} onPress={onToggleFavorite} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
        {item.summary ? (
          <Text style={[styles.summary, { color: colors.textMuted }]} numberOfLines={3}>
            {item.summary}
          </Text>
        ) : null}
        <Text style={[styles.date, { color: colors.textMuted }]}>{formatRelativeDate(item.publishedAt)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  image: { width: '100%', height: 160 },
  imageFallback: {
    height: 88,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  fallbackText: {
    fontFamily: serif,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  body: { padding: spacing.md, paddingTop: spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    flex: 1,
  },
  title: {
    fontFamily: serif,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    marginBottom: 6,
  },
  summary: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  date: { fontSize: 12 },
});
