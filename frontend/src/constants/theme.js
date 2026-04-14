import { Platform } from 'react-native';

export const COLORS = {
  primary:       '#E8705E',
  primaryDark:   '#D45A48',
  primaryLight:  '#F08878',
  secondary:     '#4ECDC4',
  secondaryDark: '#3DBDB5',
  background:    '#F5F6FA',
  surface:       '#FFFFFF',
  dark:          '#1E2340',

  textDark:  '#1E2340',
  textMid:   '#4A5568',
  textMuted: '#9BA3AF',
  textLight: '#C5CBD8',

  success: '#27AE60',
  danger:  '#E74C3C',
  warning: '#F5A623',
  gold:    '#FFD700',

  sleepREM:   '#E74C3C',
  sleepDeep:  '#4ECDC4',
  sleepLight: '#C5CBD8',
  sleepBlue:  '#6C8FC7',

  border:     '#E8EDF3',
  borderDark: '#D0D7E3',

  activeTab: '#E8705E',
  tabBar:    '#FFFFFF',
};

export const FONTS = {
  black:   'DMSans_900Black',
  bold:    'DMSans_700Bold',
  medium:  'DMSans_500Medium',
  regular: 'DMSans_400Regular',
};

export const RADIUS = {
  xs:   4,
  sm:   8,
  md:   12,
  card: 16,
  lg:   20,
  xl:   24,
  pill: 100,
};

export const SPACING = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32,
};

// Web-safe shadows — Platform.select ensures no deprecated props reach the web runtime
function shadow(y, blur, opacity, color) {
  const rgba = color
    ? `rgba(232,112,94,${opacity})`   // tinted (primary)
    : `rgba(30,35,64,${opacity})`;    // default dark

  return Platform.select({
    web: { boxShadow: `0px ${y}px ${blur}px ${rgba}` },
    default: {
      shadowColor: color || '#1E2340',
      shadowOffset: { width: 0, height: y },
      shadowOpacity: opacity,
      shadowRadius: blur,
      elevation: y * 2,
    },
  });
}

export const SHADOWS = {
  sm:      shadow(2,  8,  0.06),
  card:    shadow(4,  16, 0.08),
  md:      shadow(6,  20, 0.10),
  lg:      shadow(8,  28, 0.12),
  primary: shadow(8,  20, 0.30, '#E8705E'),
  tab: Platform.select({
    web: { boxShadow: '0px -2px 12px rgba(30,35,64,0.07)' },
    default: {
      shadowColor: '#1E2340',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.07,
      shadowRadius: 12,
      elevation: 8,
    },
  }),
};
