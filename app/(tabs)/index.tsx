import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { GuestBanner } from '@/components/GuestBanner';
import { NewsCard } from '@/components/NewsCard';
import { useAppPrefs } from '@/context/AuthContext';
import { useAppTheme } from '@/context/ThemeContext';
import { friendlyAccountError } from '@/lib/account-message';
import { promptCreateAccount, showMessage } from '@/lib/dialog';
import { loadNewsFeed, rememberFeedItems } from '@/lib/feed';
import { newsStatusLabel } from '@/lib/news-feed';
import { spacing } from '@/theme';
import type { FeedLoadResult, NewsItem } from '@/types';

export default function NewsScreen() {
  const { colors } = useAppTheme();
  const { isFavorite, toggleFavorite, rememberPendingFavorite, clearPendingFavorite } = useAppPrefs();
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
    async (item: NewsItem) => {
      const draft = {
        id: item.id,
        kind: 'news' as const,
        title: item.title,
        subtitle: item.source,
        url: item.url,
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

  const items = result?.items ?? [];
  const sourceLabel = newsStatusLabel(result?.newsSource ?? null);

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <NewsCard
          item={item}
          favorite={isFavorite(item.id)}
          onToggleFavorite={() => void onToggleFavorite(item)}
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
          <GuestBanner />
          {sourceLabel ? <Text style={[styles.source, { color: colors.textMuted }]}>{sourceLabel}</Text> : null}
          {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        </View>
      }
      ListEmptyComponent={
        result ? (
          <Text style={[styles.empty, { color: colors.textMuted }]}>No Family Compound stories yet. Pull to refresh.</Text>
        ) : (
          <Text style={[styles.empty, { color: colors.textMuted }]}>Loading news…</Text>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: 48 },
  source: { fontSize: 13, lineHeight: 18, marginBottom: spacing.md },
  error: { marginBottom: spacing.md, fontSize: 14, lineHeight: 20 },
  empty: { textAlign: 'center', marginTop: 24, fontSize: 15 },
});
