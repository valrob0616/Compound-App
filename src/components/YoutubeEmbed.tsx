import { createElement } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import { youtubeEmbedUrl } from '@/lib/affiliate';

type Props = {
  youtubeId: string;
  title: string;
};

/** YouTube embed: WebView on native, iframe on web (RN WebView is unsupported in the browser). */
export function YoutubeEmbed({ youtubeId, title }: Props) {
  const uri = youtubeEmbedUrl(youtubeId);

  if (Platform.OS === 'web') {
    return createElement('iframe', {
      src: uri,
      title,
      style: {
        width: '100%',
        height: '100%',
        border: 'none',
      },
      allow:
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen',
      allowFullScreen: true,
    });
  }

  return (
    <WebView
      source={{ uri }}
      style={styles.web}
      allowsFullscreenVideo
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      javaScriptEnabled
    />
  );
}

const styles = StyleSheet.create({
  web: { flex: 1 },
});
