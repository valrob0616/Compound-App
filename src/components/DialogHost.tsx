import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui';
import { useAppTheme } from '@/context/ThemeContext';
import { registerDialogHost, type AlertRequest, type ConfirmRequest } from '@/lib/dialog';
import { radii, spacing } from '@/theme';
import { serif } from '@/theme/typography';

export function DialogHost() {
  const { colors } = useAppTheme();
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const [alert, setAlert] = useState<AlertRequest | null>(null);
  const confirmRef = useRef<ConfirmRequest | null>(null);

  useEffect(() => {
    registerDialogHost({
      confirm: (request) => {
        confirmRef.current = request;
        setConfirm(request);
      },
      alert: (request) => setAlert(request),
    });
    return () => registerDialogHost(null);
  }, []);

  const closeConfirm = (accepted: boolean) => {
    const current = confirmRef.current;
    if (!current) return;
    confirmRef.current = null;
    setConfirm(null);
    if (accepted) current.onConfirm();
    else current.onCancel?.();
  };

  return (
    <>
      <Modal visible={confirm !== null} transparent animationType="fade" onRequestClose={() => closeConfirm(false)}>
        <View style={styles.fill}>
          <Pressable
            accessibilityLabel="Dismiss"
            accessibilityRole="button"
            onPress={() => closeConfirm(false)}
            style={[styles.backdrop, { backgroundColor: colors.overlay }]}
          />
          {confirm ? (
            <View
              accessibilityRole="alert"
              style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={[styles.title, { color: colors.text }]}>{confirm.title}</Text>
              {confirm.message ? (
                <Text style={[styles.body, { color: colors.textMuted }]}>{confirm.message}</Text>
              ) : null}
              <PrimaryButton label={confirm.confirmLabel} onPress={() => closeConfirm(true)} />
              <View style={{ height: spacing.sm }} />
              <PrimaryButton variant="secondary" label={confirm.cancelLabel} onPress={() => closeConfirm(false)} />
            </View>
          ) : null}
        </View>
      </Modal>
      <Modal visible={alert !== null} transparent animationType="fade" onRequestClose={() => setAlert(null)}>
        <View style={styles.fill}>
          <Pressable
            accessibilityLabel="Dismiss"
            accessibilityRole="button"
            onPress={() => setAlert(null)}
            style={[styles.backdrop, { backgroundColor: colors.overlay }]}
          />
          {alert ? (
            <View accessibilityRole="alert" style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.title, { color: colors.text }]}>{alert.title}</Text>
              {alert.message ? <Text style={[styles.body, { color: colors.textMuted }]}>{alert.message}</Text> : null}
              <PrimaryButton label="OK" onPress={() => setAlert(null)} />
            </View>
          ) : null}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill },
  sheet: {
    margin: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  title: { fontFamily: serif, fontSize: 22, fontWeight: '700', marginBottom: spacing.sm },
  body: { fontSize: 15, lineHeight: 21, marginBottom: spacing.md },
});
