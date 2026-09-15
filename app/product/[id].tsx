import * as WebBrowser from 'expo-web-browser';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui';
import { CATEGORY_LABELS, amazonAssociateTag, isPlaceholderAssociateTag } from '@/constants/config';
import { useAppTheme } from '@/context/ThemeContext';
import { amazonImageUrl, amazonProductUrl } from '@/lib/affiliate';
import { getProductById } from '@/lib/catalog';
import { radii, spacing } from '@/theme';
import { serif } from '@/theme/typography';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const product = id ? getProductById(id) : undefined;

  useEffect(() => {
    navigation.setOptions({ title: product?.title.slice(0, 42) ?? 'Product' });
  }, [navigation, product?.title]);

  if (!product) {
    return (
      <View style={[styles.fallback, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>This product is not in the catalog.</Text>
      </View>
    );
  }

  const href = amazonProductUrl(product.asin, amazonAssociateTag());
  const categoryLabel =
    product.category === 'both' ? 'Homesteading & Family Compounds' : CATEGORY_LABELS[product.category];

  return (
    <ScrollView contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}>
      <View style={[styles.imageWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Image
          source={{ uri: amazonImageUrl(product.asin) }}
          style={styles.image}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </View>
      <Text style={[styles.kicker, { color: colors.accent }]}>{categoryLabel}</Text>
      <Text style={[styles.title, { color: colors.text }]}>{product.title}</Text>
      <Text style={[styles.blurb, { color: colors.textMuted }]}>{product.blurb}</Text>
      <Text style={[styles.asin, { color: colors.textMuted }]}>ASIN {product.asin}</Text>
      {isPlaceholderAssociateTag() ? (
        <Text style={[styles.note, { color: colors.textMuted }]}>
          Opens Amazon with placeholder tag `yourtag-20`. Replace EXPO_PUBLIC_AMAZON_ASSOCIATE_TAG
          before publishing.
        </Text>
      ) : null}
      <PrimaryButton
        label="View on Amazon"
        onPress={() => void WebBrowser.openBrowserAsync(href)}
        accessibilityHint="Opens the Amazon product page with the configured affiliate tag"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: 48 },
  imageWrap: {
    borderWidth: 1,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  image: { width: '100%', height: 240 },
  kicker: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontFamily: serif, fontSize: 28, fontWeight: '700', marginVertical: 8 },
  blurb: { fontSize: 16, lineHeight: 24, marginBottom: spacing.md },
  asin: { fontSize: 12, marginBottom: spacing.md },
  note: { fontSize: 13, lineHeight: 18, marginBottom: spacing.md },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
});
