import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FavoriteButton } from '@/components/FavoriteButton';
import { useAppTheme } from '@/context/ThemeContext';
import { youtubeThumbUrl } from '@/lib/affiliate';
import { radii, spacing } from '@/theme';
import { serif } from '@/theme/typography';
import type { VideoItem } from '@/types';

type Props = {
  item: VideoItem;
  favorite: boolean;
  onOpen: () => void;
  onToggleFavorite: () => void;
};

export function VideoCard({ item, favorite, onOpen, onToggleFavorite }: Props) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`Video: ${item.title}`}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View>
        <Image
          source={{ uri: youtubeThumbUrl(item.youtubeId) }}
          style={styles.image}
          accessibilityIgnoresInvertColors
        />
        <View style={styles.playBadge} accessibilityElementsHidden>
          <Ionicons name="play" size={22} color="#fff" />
        </View>
        {item.durationLabel ? (
          <View style={styles.duration}>
            <Text style={styles.durationText}>{item.durationLabel}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <View style={styles.metaRow}>
          <Text style={[styles.kicker, { color: colors.tint }]}>YouTube · {item.channel}</Text>
          <FavoriteButton active={favorite} onPress={onToggleFavorite} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.summary, { color: colors.textMuted }]} numberOfLines={3}>
          {item.summary}
        </Text>
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
  image: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#1C3028' },
  playBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '38%',
    left: '42%',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(28, 48, 40, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  duration: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  durationText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  body: { padding: spacing.md, paddingTop: spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
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
  summary: { fontSize: 14, lineHeight: 20 },
});
