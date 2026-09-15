import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import { lookupFeedItem } from '@/lib/feed';

export default function ArticleScreen() {
  const { id, url, title } = useLocalSearchParams<{ id: string; url?: string; title?: string }>();
  const navigation = useNavigation();
  const item = id ? lookupFeedItem(id) : undefined;
  const href = url ?? (item && item.kind === 'news' ? item.url : undefined);
  const heading = title ?? (item && item.kind === 'news' ? item.title : 'Article');

  useEffect(() => {
    navigation.setOptions({ title: heading?.slice(0, 42) ?? 'Article' });
  }, [heading, navigation]);

  if (!href) {
    return null;
  }

  return (
    <WebView
      source={{ uri: href }}
      style={styles.web}
      startInLoadingState
      allowsBackForwardNavigationGestures
    />
  );
}

const styles = StyleSheet.create({
  web: { flex: 1 },
});
