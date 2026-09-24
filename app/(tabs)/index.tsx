import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { FeaturedVideosLink } from '@/components/FeaturedVideosLink';
import { GuestBanner } from '@/components/GuestBanner';
import { NewsCard } from '@/components/NewsCard';
import { CATEGORY_BLURBS } from '@/constants/config';
import { useAppPrefs } from '@/context/AuthContext';
import { useAppTheme } from '@/context/ThemeContext';
import { loadNewsFeed, rememberFeedItems } from '@/lib/feed';
import { spacing } from '@/theme';
import { serif } from '@/theme/typography';
import type { FeedLoadResult, NewsItem } from '@/types';

export default function FeedScreen() {
  const { colors } = useAppTheme();
  const { isFavorite, toggleFavorite } = useAppPrefs();
  const router = useRouter();
  const [result, setResult] = useState<FeedLoadResult | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const next = await loadNewsFeed();
      rememberFeedItems(next.items);
      setResult(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the feed.');
    }
  }, []);

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
      ? 'Live Family Compound RSS'
      : result?.newsSource === 'mixed'
        ? 'Live Family Compound RSS, plus seed briefings where a feed was short'
        : 'Seed briefings (Family Compound RSS unavailable on this network or blocked by CORS on web)';

  const items = (result?.items ?? []) as NewsItem[];

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
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
      )}
      contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}
      style={{ backgroundColor: colors.background }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />
      }
      ListHeaderComponent={
        <View>
          <Text style={[styles.kicker, { color: colors.accent }]}>RSS</Text>
          <Text style={[styles.title, { color: colors.text }]}>Family Compound news</Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            {CATEGORY_BLURBS['family-compounds']}
          </Text>
          <GuestBanner />
          <FeaturedVideosLink />
          <Text style={[styles.source, { color: colors.textMuted }]}>{sourceLabel}</Text>
          {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        </View>
      }
      ListEmptyComponent={
        <Text style={[styles.empty, { color: colors.textMuted }]}>Pull to refresh Family Compound news.</Text>
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
  source: { fontSize: 12, marginBottom: spacing.md },
  error: { marginBottom: spacing.md, fontSize: 13 },
  empty: { textAlign: 'center', marginTop: 24 },
});
