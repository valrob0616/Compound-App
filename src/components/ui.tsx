import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { useAppTheme } from '@/context/ThemeContext';
import { radii, spacing } from '@/theme';
import { serif } from '@/theme/typography';

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  accessibilityHint?: string;
};

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  accessibilityHint,
}: ButtonProps) {
  const { colors } = useAppTheme();
  const background =
    variant === 'primary' ? colors.tint : variant === 'secondary' ? colors.cardMuted : 'transparent';
  const textColor = variant === 'primary' ? colors.headerText : colors.text;
  const borderColor = variant === 'ghost' ? 'transparent' : colors.border;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: background,
          borderColor,
          opacity: disabled || loading ? 0.55 : pressed ? 0.85 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.buttonLabel, { color: textColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

type FieldProps = TextInputProps & { label: string; error?: string };

export function TextField({ label, error, ...rest }: FieldProps) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          {
            color: colors.text,
            backgroundColor: colors.card,
            borderColor: error ? colors.danger : colors.border,
          },
        ]}
        {...rest}
      />
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

export function AuthModePill({ mode }: { mode: 'demo' | 'supabase' }) {
  const { colors } = useAppTheme();
  const label = mode === 'demo' ? 'Demo auth (local)' : 'Supabase auth';
  return (
    <View style={[styles.pill, { backgroundColor: colors.cardMuted, borderColor: colors.border }]}>
      <Text style={[styles.pillText, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

export function ScreenTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.titleBlock}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
  },
  buttonLabel: { fontSize: 16, fontWeight: '700' },
  field: { marginBottom: spacing.md },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 48,
  },
  error: { marginTop: 4, fontSize: 12 },
  pill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: { fontSize: 12, fontWeight: '600' },
  titleBlock: { marginBottom: spacing.md },
  title: { fontFamily: serif, fontSize: 28, fontWeight: '700' },
  subtitle: { marginTop: 6, fontSize: 15, lineHeight: 21 },
});
