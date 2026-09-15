import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { CategorySwitcher } from '@/components/CategorySwitcher';
import { GuestBanner } from '@/components/GuestBanner';
import { ProductCard } from '@/components/ProductCard';
import { isPlaceholderAssociateTag } from '@/constants/config';
import { useAppPrefs } from '@/context/AuthContext';
import { useAppTheme } from '@/context/ThemeContext';
import { productsForCategory } from '@/lib/catalog';
import { spacing } from '@/theme';

export default function StoreScreen() {
  const { colors } = useAppTheme();
  const { category, setCategory } = useAppPrefs();
  const router = useRouter();
  const [filter, setFilter] = useState(category);
  const products = useMemo(() => productsForCategory(filter), [filter]);
  const placeholderTag = isPlaceholderAssociateTag();

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}
      style={{ backgroundColor: colors.background }}
      ListHeaderComponent={
        <View>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            Curated tools, seeds, solar, fencing, canning, and compound gear. Tapping a product opens
            Amazon with the Associates tag from your environment config.
          </Text>
          {placeholderTag ? (
            <Pressable
              accessibilityRole="text"
              style={[styles.note, { backgroundColor: colors.cardMuted, borderColor: colors.border }]}
            >
              <Text style={[styles.noteText, { color: colors.text }]}>
                Affiliate tag is still the placeholder `yourtag-20`. Set EXPO_PUBLIC_AMAZON_ASSOCIATE_TAG
                to your Amazon Associates ID before shipping.
              </Text>
            </Pressable>
          ) : null}
          <CategorySwitcher
            value={filter}
            onChange={(next) => {
              setFilter(next);
              setCategory(next);
            }}
          />
          <GuestBanner />
        </View>
      }
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: 48, gap: spacing.md },
  row: { gap: spacing.md, marginBottom: spacing.md },
  lede: { fontSize: 14, lineHeight: 20, marginBottom: spacing.md },
  note: { borderWidth: 1, borderRadius: 12, padding: spacing.md, marginBottom: spacing.md },
  noteText: { fontSize: 13, lineHeight: 18 },
});
