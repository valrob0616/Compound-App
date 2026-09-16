import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { CategorySwitcher } from '@/components/CategorySwitcher';
import { FeaturedVideosLink } from '@/components/FeaturedVideosLink';
import { GuestBanner } from '@/components/GuestBanner';
import { NewsCard } from '@/components/NewsCard';
import { VideoCard } from '@/components/VideoCard';
import { useAppPrefs } from '@/context/AuthContext';
import { useAppTheme } from '@/context/ThemeContext';
import { loadCategoryFeed, rememberFeedItems } from '@/lib/feed';
import { spacing } from '@/theme';
import type { FeedItem, FeedLoadResult } from '@/types';

export default function FeedScreen() {
  const { colors } = useAppTheme();
  const { category, setCategory, isFavorite, toggleFavorite } = useAppPrefs();
  const router = useRouter();
  const [result, setResult] = useState<FeedLoadResult | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const next = await loadCategoryFeed(category);
      rememberFeedItems(next.items);
      setResult(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the feed.');
    }
  }, [category]);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

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

  const sourceLabel =
    result?.newsSource === 'live'
      ? 'Live RSS plus curated video'
      : result?.newsSource === 'mixed'
        ? 'Live RSS, seed stories, and curated video'
        : 'Seed stories and curated video (RSS unavailable on this network or blocked by CORS on web)';

  const items = result?.items ?? [];

  const renderItem = ({ item }: { item: FeedItem }) => {
    if (item.kind === 'news') {
      return (
        <NewsCard
          item={item}
          favorite={isFavorite(item.id)}
          onToggleFavorite={() => void onToggleFavorite(item.id)}
          onOpen={() =>
            router.push({
              pathname: '/article/[id]',
              params: { id: item.id, url: item.url, title: item.title },
            })
          }
        />
      );
    }
    return (
      <VideoCard
        item={item}
        favorite={isFavorite(item.id)}
        onToggleFavorite={() => void onToggleFavorite(item.id)}
        onOpen={() =>
          router.push({
            pathname: '/video/[id]',
            params: { id: item.id, youtubeId: item.youtubeId, title: item.title },
          })
        }
      />
    );
  };

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}
      style={{ backgroundColor: colors.background }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />
      }
      ListHeaderComponent={
        <View>
          <CategorySwitcher value={category} onChange={setCategory} />
          <GuestBanner />
          <FeaturedVideosLink category={category} />
          <Text style={[styles.source, { color: colors.textMuted }]}>{sourceLabel}</Text>
          {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        </View>
      }
      ListEmptyComponent={
        <Text style={[styles.empty, { color: colors.textMuted }]}>Pull to refresh the feed.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: 48 },
  source: { fontSize: 12, marginBottom: spacing.md },
  error: { marginBottom: spacing.md, fontSize: 13 },
  empty: { textAlign: 'center', marginTop: 24 },
});
