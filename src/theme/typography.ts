import { Platform } from 'react-native';

export const serif = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia',
}) as string;
