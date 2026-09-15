import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/context/ThemeContext';
import { amazonImageUrl } from '@/lib/affiliate';
import { CATEGORY_LABELS } from '@/constants/config';
import { radii, spacing } from '@/theme';
import { serif } from '@/theme/typography';
import type { Product } from '@/types';

type Props = {
  product: Product;
  onPress: () => void;
};

export function ProductCard({ product, onPress }: Props) {
  const { colors } = useAppTheme();
  const categoryLabel =
    product.category === 'both' ? 'Both areas' : CATEGORY_LABELS[product.category];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${product.title}. ${categoryLabel}`}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <Image
        source={{ uri: amazonImageUrl(product.asin) }}
        style={[styles.image, { backgroundColor: colors.cardMuted }]}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
      <View style={styles.body}>
        <Text style={[styles.kicker, { color: colors.accent }]}>{categoryLabel}</Text>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={[styles.blurb, { color: colors.textMuted }]} numberOfLines={3}>
          {product.blurb}
        </Text>
        <Text style={[styles.cta, { color: colors.tint }]}>View on Amazon</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    minWidth: '47%',
    maxWidth: '48%',
  },
  image: { width: '100%', height: 140, padding: 8 },
  body: { padding: spacing.sm, paddingBottom: spacing.md, gap: 4 },
  kicker: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontFamily: serif, fontSize: 16, lineHeight: 20, fontWeight: '700' },
  blurb: { fontSize: 12, lineHeight: 16 },
  cta: { marginTop: 4, fontSize: 13, fontWeight: '700' },
});
