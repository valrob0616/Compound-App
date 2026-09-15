import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CATEGORY_BLURBS, CATEGORY_LABELS } from '@/constants/config';
import { useAppTheme } from '@/context/ThemeContext';
import { radii, spacing } from '@/theme';
import { serif } from '@/theme/typography';
import type { CategoryId } from '@/types';

type Props = {
  value: CategoryId;
  onChange: (category: CategoryId) => void;
};

const OPTIONS: CategoryId[] = ['homesteading', 'family-compounds'];

export function CategorySwitcher({ value, onChange }: Props) {
  const { colors } = useAppTheme();

  return (
    <View>
      <View
        style={[styles.row, { backgroundColor: colors.cardMuted, borderColor: colors.border }]}
        accessibilityRole="tablist"
      >
        {OPTIONS.map((option) => {
          const active = option === value;
          return (
            <Pressable
              key={option}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={CATEGORY_LABELS[option]}
              onPress={() => onChange(option)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.chipActive : 'transparent',
                },
              ]}
            >
              <Text
                style={[
                  styles.chipLabel,
                  { color: active ? colors.chipActiveText : colors.text },
                ]}
              >
                {CATEGORY_LABELS[option]}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.blurb, { color: colors.textMuted }]}>{CATEGORY_BLURBS[value]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    gap: 4,
  },
  chip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  chipLabel: {
    fontFamily: serif,
    fontSize: 15,
    fontWeight: '600',
  },
  blurb: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
  },
});
