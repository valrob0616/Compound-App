import * as WebBrowser from 'expo-web-browser';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui';
import { APP_DISPLAY_NAME, privacyContactEmail } from '@/constants/config';
import { useAppTheme } from '@/context/ThemeContext';
import type { LegalDocument } from '@/content/legal';
import { spacing } from '@/theme';
import { serif } from '@/theme/typography';

type Props = {
  document: LegalDocument;
  hostedUrl?: string;
};

export function LegalDocumentView({ document, hostedUrl }: Props) {
  const { colors } = useAppTheme();
  const contact = privacyContactEmail();

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}
      style={{ backgroundColor: colors.background }}
    >
      <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
        {document.title}
      </Text>
      <Text style={[styles.meta, { color: colors.textMuted }]}>
        {APP_DISPLAY_NAME} · LFH Inc{'\n'}
        Effective {document.effectiveDate}
      </Text>
      {document.blocks.map((block, index) => {
        if (block.type === 'h2') {
          return (
            <Text key={index} style={[styles.h2, { color: colors.tint }]} accessibilityRole="header">
              {block.text}
            </Text>
          );
        }
        if (block.type === 'ul') {
          return (
            <View key={index} style={styles.list}>
              {block.items.map((item, itemIndex) => (
                <Text key={`${index}-${itemIndex}`} style={[styles.li, { color: colors.text }]}>
                  • {item}
                </Text>
              ))}
            </View>
          );
        }
        return (
          <Text key={index} style={[styles.p, { color: colors.text }]}>
            {block.text}
          </Text>
        );
      })}
      <Text style={[styles.p, { color: colors.textMuted }]}>Privacy contact: {contact}</Text>
      {hostedUrl ? (
        <View style={styles.host}>
          <PrimaryButton
            variant="secondary"
            label="Open hosted page"
            accessibilityHint="Opens the public privacy or terms URL in a browser"
            onPress={() => void WebBrowser.openBrowserAsync(hostedUrl)}
          />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: 48 },
  title: { fontFamily: serif, fontSize: 28, fontWeight: '700', marginBottom: 8 },
  meta: { fontSize: 13, lineHeight: 18, marginBottom: spacing.lg },
  h2: { fontFamily: serif, fontSize: 18, fontWeight: '700', marginTop: spacing.lg, marginBottom: 8 },
  p: { fontSize: 15, lineHeight: 22, marginBottom: 10 },
  list: { marginBottom: 10, gap: 6 },
  li: { fontSize: 15, lineHeight: 22 },
  host: { marginTop: spacing.lg },
});
