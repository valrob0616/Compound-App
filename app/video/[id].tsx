import * as WebBrowser from 'expo-web-browser';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

import { PrimaryButton } from '@/components/ui';
import { VideoDisclaimer } from '@/components/VideoDisclaimer';
import { YoutubeEmbed } from '@/components/YoutubeEmbed';
import { useAppTheme } from '@/context/ThemeContext';
import { youtubeWatchUrl } from '@/lib/affiliate';
import { lookupFeedItem } from '@/lib/feed';
import { spacing } from '@/theme';

export default function VideoScreen() {
  const { id, youtubeId, title } = useLocalSearchParams<{
    id: string;
    youtubeId?: string;
    title?: string;
  }>();
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const item = id ? lookupFeedItem(id) : undefined;
  const videoId = youtubeId ?? (item && item.kind === 'video' ? item.youtubeId : undefined);
  const resolvedVideoId = Array.isArray(videoId) ? videoId[0] : videoId;
  const heading = title ?? (item && item.kind === 'video' ? item.title : 'Video');
  const headingText = Array.isArray(heading) ? heading[0] : heading;

  useEffect(() => {
    navigation.setOptions({ title: headingText?.slice(0, 42) ?? 'Video' });
  }, [headingText, navigation]);

  if (!resolvedVideoId) {
    return (
      <View style={[styles.fallback, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>This video could not be found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { backgroundColor: colors.background }]}>
      <View style={styles.player}>
        <YoutubeEmbed youtubeId={resolvedVideoId} title={headingText ?? 'YouTube video'} />
      </View>
      <ScrollView contentContainerStyle={styles.meta} style={{ backgroundColor: colors.background }}>
        <Text style={[styles.title, { color: colors.text }]}>{headingText}</Text>
        {item && item.kind === 'video' ? (
          <Text style={[styles.summary, { color: colors.textMuted }]}>{item.summary}</Text>
        ) : null}
        {item && item.kind === 'video' ? (
          <Text style={[styles.channel, { color: colors.tint }]}>YouTube · {item.channel}</Text>
        ) : null}
        <VideoDisclaimer compact />
        <PrimaryButton
          label="Open in YouTube"
          variant="secondary"
          onPress={() => void WebBrowser.openBrowserAsync(youtubeWatchUrl(resolvedVideoId))}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  player: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000' },
  meta: { padding: spacing.md, gap: spacing.md, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: '700' },
  summary: { fontSize: 15, lineHeight: 22 },
  channel: { fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
});
