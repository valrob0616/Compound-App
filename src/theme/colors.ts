export const palette = {
  forest: '#2C4A3E',
  forestDeep: '#1C3028',
  sage: '#6B8F71',
  cream: '#F4EFE6',
  paper: '#FBF8F2',
  clay: '#B85C38',
  wheat: '#C4A35A',
  bark: '#2A2622',
  barkMuted: '#5C534A',
  line: '#E4D9C8',
  danger: '#9B3A2F',
  success: '#3E6B4F',
} as const;

export type ThemeColors = {
  background: string;
  card: string;
  cardMuted: string;
  text: string;
  textMuted: string;
  tint: string;
  accent: string;
  border: string;
  tabBar: string;
  tabInactive: string;
  overlay: string;
  chip: string;
  chipActive: string;
  chipActiveText: string;
  header: string;
  headerText: string;
  success: string;
  danger: string;
  wheat: string;
  sage: string;
};

export const lightColors: ThemeColors = {
  background: palette.paper,
  card: '#FFFFFF',
  cardMuted: palette.cream,
  text: palette.bark,
  textMuted: palette.barkMuted,
  tint: palette.forest,
  accent: palette.clay,
  border: palette.line,
  tabBar: '#FFFdf8',
  tabInactive: '#8A8176',
  overlay: 'rgba(28, 48, 40, 0.55)',
  chip: palette.cream,
  chipActive: palette.forest,
  chipActiveText: palette.cream,
  header: palette.forest,
  headerText: palette.cream,
  success: palette.success,
  danger: palette.danger,
  wheat: palette.wheat,
  sage: palette.sage,
};

export const darkColors: ThemeColors = {
  background: '#15201B',
  card: '#1F2D27',
  cardMuted: '#24352E',
  text: '#F4EFE6',
  textMuted: '#C4B8A8',
  tint: '#A3C4AB',
  accent: '#D48966',
  border: '#31463C',
  tabBar: '#121A16',
  tabInactive: '#8A958E',
  overlay: 'rgba(0, 0, 0, 0.55)',
  chip: '#24352E',
  chipActive: '#A3C4AB',
  chipActiveText: '#15201B',
  header: '#121A16',
  headerText: '#F4EFE6',
  success: '#7DAB8A',
  danger: '#E08B82',
  wheat: '#C4A35A',
  sage: '#6B8F71',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const APP_NAME = 'Family Compound & Homestead Living';
export const APP_TAGLINE = 'News, video, and gear for the land and the people on it.';
