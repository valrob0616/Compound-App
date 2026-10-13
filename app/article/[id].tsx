import * as WebBrowser from 'expo-web-browser';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { PrimaryButton } from '@/components/ui';
import { useAppTheme } from '@/context/ThemeContext';
import { lookupFeedItem } from '@/lib/feed';
import { spacing } from '@/theme';
import { serif } from '@/theme/typography';

export default function ArticleScreen() {
  const { id, url, title } = useLocalSearchParams<{ id: string; url?: string; title?: string }>();
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const item = id ? lookupFeedItem(id) : undefined;
  const href = url ?? (item && item.kind === 'news' ? item.url : undefined);
  const heading = title ?? (item && item.kind === 'news' ? item.title : 'Article');
  const summary = item && item.kind === 'news' ? item.summary : undefined;
  const source = item && item.kind === 'news' ? item.source : undefined;

  useEffect(() => {
    navigation.setOptions({ title: 'Article' });
  }, [navigation]);

  const openArticle = () => {
    if (href) void WebBrowser.openBrowserAsync(href);
  };

  if (!href) {
    return (
      <View style={[styles.fallback, { backgroundColor: colors.background }]}>
        <Text style={[styles.missing, { color: colors.text }]}>This article could not be found.</Text>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <ScrollView
        contentContainerStyle={[styles.webFallback, { backgroundColor: colors.background }]}
        style={{ backgroundColor: colors.background }}
      >
        {source ? <Text style={[styles.source, { color: colors.accent }]}>{source}</Text> : null}
        <Text style={[styles.title, { color: colors.text }]}>{heading}</Text>
        {summary ? <Text style={[styles.summary, { color: colors.textMuted }]}>{summary}</Text> : null}
        <Text style={[styles.note, { color: colors.textMuted }]}>
          This preview opens the story on the publisher’s site.
        </Text>
        <PrimaryButton label="Open article" onPress={openArticle} />
      </ScrollView>
    );
  }

  return (
    <View style={[styles.native, { backgroundColor: colors.background }]}>
      <View style={styles.nativeBar}>
        <Text style={[styles.nativeTitle, { color: colors.text }]}>{heading}</Text>
        <PrimaryButton label="Open article" variant="secondary" onPress={openArticle} />
      </View>
      <WebView source={{ uri: href }} style={styles.web} startInLoadingState allowsBackForwardNavigationGestures />
    </View>
  );
}

const styles = StyleSheet.create({
  web: { flex: 1 },
  native: { flex: 1 },
  nativeBar: { padding: spacing.md, gap: spacing.sm },
  nativeTitle: { fontFamily: serif, fontSize: 20, lineHeight: 26, fontWeight: '700' },
  webFallback: { padding: spacing.md, paddingBottom: 48, gap: spacing.md },
  source: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  title: { fontFamily: serif, fontSize: 28, lineHeight: 34, fontWeight: '700' },
  summary: { fontSize: 16, lineHeight: 23 },
  note: { fontSize: 14, lineHeight: 20 },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  missing: { fontSize: 16, textAlign: 'center' },
});
