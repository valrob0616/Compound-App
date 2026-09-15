import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { CategorySwitcher } from '@/components/CategorySwitcher';
import { GuestBanner } from '@/components/GuestBanner';
import { ProductCard } from '@/components/ProductCard';
import { STORE_CATALOG_ENABLED } from '@/constants/config';
import { useAppPrefs } from '@/context/AuthContext';
import { useAppTheme } from '@/context/ThemeContext';
import { productsForCategory } from '@/lib/catalog';
import { radii, spacing } from '@/theme';
import { serif } from '@/theme/typography';

export default function StoreScreen() {
  if (STORE_CATALOG_ENABLED) {
    return <CatalogStore />;
  }
  return <ComingSoonStore />;
}

function ComingSoonStore() {
  const { colors } = useAppTheme();

  return (
    <ScrollView
      contentContainerStyle={[styles.comingSoonContent, { backgroundColor: colors.background }]}
      style={{ backgroundColor: colors.background }}
    >
      <View
        style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.border }]}
        accessibilityRole="summary"
        accessibilityLabel="Store coming soon"
      >
        <View style={[styles.iconWrap, { backgroundColor: colors.cardMuted }]}>
          <Ionicons name="bag-handle-outline" size={36} color={colors.tint} />
        </View>
        <Text style={[styles.kicker, { color: colors.accent }]}>Store</Text>
        <Text style={[styles.title, { color: colors.text }]}>Coming soon</Text>
        <Text style={[styles.body, { color: colors.textMuted }]}>
          A curated shop for Homesteading and Family Compounds will open after this first release —
          tools, seeds, solar, fencing, canning, and compound gear. Amazon affiliate picks will be
          added then.
        </Text>
        <View style={styles.pills}>
          <View style={[styles.pill, { backgroundColor: colors.cardMuted, borderColor: colors.border }]}>
            <Text style={[styles.pillText, { color: colors.text }]}>Homesteading</Text>
          </View>
          <View style={[styles.pill, { backgroundColor: colors.cardMuted, borderColor: colors.border }]}>
            <Text style={[styles.pillText, { color: colors.text }]}>Family Compounds</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function CatalogStore() {
  const { colors } = useAppTheme();
  const { category, setCategory } = useAppPrefs();
  const router = useRouter();
  const [filter, setFilter] = useState(category);
  const products = useMemo(() => productsForCategory(filter), [filter]);

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={[styles.catalogContent, { backgroundColor: colors.background }]}
      style={{ backgroundColor: colors.background }}
      ListHeaderComponent={
        <View>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            Curated tools, seeds, solar, fencing, canning, and compound gear for Homesteading and
            Family Compounds.
          </Text>
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
  comingSoonContent: {
    flexGrow: 1,
    padding: spacing.md,
    paddingBottom: 48,
    justifyContent: 'center',
  },
  hero: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    fontFamily: serif,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  pill: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillText: { fontSize: 13, fontWeight: '700' },
  catalogContent: { padding: spacing.md, paddingBottom: 48, gap: spacing.md },
  row: { gap: spacing.md, marginBottom: spacing.md },
  lede: { fontSize: 14, lineHeight: 20, marginBottom: spacing.md },
});
