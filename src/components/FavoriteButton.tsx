import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { useAppTheme } from '@/context/ThemeContext';

type Props = {
  active: boolean;
  onPress: () => void;
  disabled?: boolean;
};

export function FavoriteButton({ active, onPress, disabled }: Props) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={active ? 'Remove from favorites' : 'Save to favorites'}
      style={styles.hit}
    >
      <Ionicons
        name={active ? 'bookmark' : 'bookmark-outline'}
        size={22}
        color={active ? colors.accent : colors.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
