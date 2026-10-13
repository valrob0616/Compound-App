import { useCallback, useEffect, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { CategorySwitcher } from '@/components/CategorySwitcher';
import { GuestBanner } from '@/components/GuestBanner';
import { VideoCard } from '@/components/VideoCard';
import { VideoDisclaimer } from '@/components/VideoDisclaimer';
import { useAppPrefs } from '@/context/AuthContext';
import { useAppTheme } from '@/context/ThemeContext';
import { friendlyAccountError } from '@/lib/account-message';
import { promptCreateAccount, showMessage } from '@/lib/dialog';
import { rememberFeedItems } from '@/lib/feed';
import { videosForCategory } from '@/lib/videos';
import { spacing } from '@/theme';
import type { VideoItem } from '@/types';

export default function VideosScreen() {
  const { colors } = useAppTheme();
  const { category, setCategory, isFavorite, toggleFavorite, rememberPendingFavorite, clearPendingFavorite } =
    useAppPrefs();
  const router = useRouter();
  const videos = useMemo(() => videosForCategory(category), [category]);

  useEffect(() => {
    rememberFeedItems(videos);
  }, [videos]);

  const onToggleFavorite = useCallback(
    async (item: VideoItem) => {
      const draft = {
        id: item.id,
        kind: 'video' as const,
        title: item.title,
        subtitle: item.channel,
        youtubeId: item.youtubeId,
      };
      try {
        const ok = await toggleFavorite(draft);
        if (!ok) {
          rememberPendingFavorite(draft);
          promptCreateAccount(() => router.push('/auth/sign-up'), clearPendingFavorite);
        }
      } catch (err) {
        showMessage('Could not save favorite', friendlyAccountError(err));
      }
    },
    [clearPendingFavorite, rememberPendingFavorite, router, toggleFavorite],
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
          onToggleFavorite={() => void onToggleFavorite(item)}
          onOpen={() => openVideo(item)}
        />
      )}
      contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}
      style={{ backgroundColor: colors.background }}
      ListHeaderComponent={
        <View>
          <CategorySwitcher value={category} onChange={setCategory} showBlurb={false} />
          <VideoDisclaimer collapsible />
          <GuestBanner />
        </View>
      }
      ListEmptyComponent={
        <Text style={[styles.empty, { color: colors.textMuted }]}>No featured videos for this category yet.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: 48 },
  empty: { textAlign: 'center', marginTop: 24, fontSize: 15 },
});
