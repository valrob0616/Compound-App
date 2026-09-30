import { Alert, Platform } from 'react-native';

/** Alert.alert is a no-op on react-native-web, so web uses window.alert / confirm. */
export function showMessage(title: string, message?: string): void {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}

export function promptCreateAccount(onCreate: () => void): void {
  const message = 'Create an account to save favorites on your account.';
  if (Platform.OS === 'web') {
    if (window.confirm(message)) onCreate();
    return;
  }
  Alert.alert('Save favorites', message, [
    { text: 'Not now', style: 'cancel' },
    { text: 'Create account', onPress: onCreate },
  ]);
}

export function confirmAction(
  title: string,
  message: string,
  confirmLabel: string,
  onConfirm: () => void,
): void {
  if (Platform.OS === 'web') {
    if (window.confirm(message ? `${title}\n\n${message}` : title)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
