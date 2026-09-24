import { useCallback, useEffect, useMemo } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { CategorySwitcher } from '@/components/CategorySwitcher';
import { GuestBanner } from '@/components/GuestBanner';
import { VideoCard } from '@/components/VideoCard';
import { VideoDisclaimer } from '@/components/VideoDisclaimer';
import { CATEGORY_LABELS } from '@/constants/config';
import { useAppPrefs } from '@/context/AuthContext';
import { useAppTheme } from '@/context/ThemeContext';
import { rememberFeedItems } from '@/lib/feed';
import { videosForCategory } from '@/lib/videos';
import { spacing } from '@/theme';
import { serif } from '@/theme/typography';
import type { VideoItem } from '@/types';

export default function VideosScreen() {
  const { colors } = useAppTheme();
  const { category, setCategory, isFavorite, toggleFavorite } = useAppPrefs();
  const router = useRouter();
  const videos = useMemo(() => videosForCategory(category), [category]);

  useEffect(() => {
    rememberFeedItems(videos);
  }, [videos]);

  const onToggleFavorite = useCallback(
    async (id: string) => {
      const ok = await toggleFavorite(id);
      if (!ok) {
        Alert.alert('Save favorites', 'Create an account to save favorites across sessions.', [
          { text: 'Not now', style: 'cancel' },
          { text: 'Create account', onPress: () => router.push('/auth/sign-up') },
        ]);
      }
    },
    [router, toggleFavorite],
  );

  const openVideo = useCallback(
    (item: VideoItem) => {
      router.push({
        pathname: '/video/[id]',
        params: { id: item.id, youtubeId: item.youtubeId, title: item.title },
      });
    },
    [router],
  );

  return (
    <FlatList
      data={videos}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <VideoCard
          item={item}
          favorite={isFavorite(item.id)}
          onToggleFavorite={() => void onToggleFavorite(item.id)}
          onOpen={() => openVideo(item)}
        />
      )}
      contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}
      style={{ backgroundColor: colors.background }}
      ListHeaderComponent={
        <View>
          <Text style={[styles.kicker, { color: colors.accent }]}>YouTube</Text>
          <Text style={[styles.title, { color: colors.text }]}>Featured videos</Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            Curated {CATEGORY_LABELS[category]} videos, separate from Family Compound news. Switch
            categories to see Homesteading or Family Compounds featured content.
          </Text>
          <CategorySwitcher value={category} onChange={setCategory} />
          <VideoDisclaimer />
          <GuestBanner />
        </View>
      }
      ListEmptyComponent={
        <Text style={[styles.empty, { color: colors.textMuted }]}>
          No featured videos for this category yet.
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: 48 },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontFamily: serif,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
  },
  lede: { fontSize: 15, lineHeight: 21, marginBottom: spacing.md },
  empty: { textAlign: 'center', marginTop: 24 },
});
