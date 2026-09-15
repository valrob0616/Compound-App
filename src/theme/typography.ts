import { Platform } from 'react-native';

export const serif = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia',
}) as string;

export const sans = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
}) as string;
