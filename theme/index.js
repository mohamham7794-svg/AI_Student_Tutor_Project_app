import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  primary: '#534AB7',
  primaryLight: '#EEEDFE',
  primaryMid: '#AFA9EC',
  primaryDark: '#3C3489',
  primaryDeep: '#26215C',

  teal: '#0F6E56',
  tealLight: '#E1F5EE',
  tealMid: '#5DCAA5',

  amber: '#854F0B',
  amberLight: '#FAEEDA',
  amberMid: '#EF9F27',

  coral: '#993C1D',
  coralLight: '#FAECE7',
  coralMid: '#F0997B',

  success: '#1D9E75',
  successLight: '#E1F5EE',

  danger: '#E24B4A',
  dangerLight: '#FCEBEB',

  white: '#FFFFFF',
  background: '#F7F6FF',
  surface: '#FFFFFF',
  surfaceSecondary: '#F4F3FE',

  text: '#1A1830',
  textSecondary: '#5A5780',
  textTertiary: '#9896B8',

  border: 'rgba(83, 74, 183, 0.12)',
  borderMed: 'rgba(83, 74, 183, 0.25)',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const SIZES = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,

  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,
  radiusFull: 999,

  paddingSm: 12,
  paddingMd: 16,
  paddingLg: 20,
  paddingXl: 24,

  screenWidth: width,
  screenHeight: height,
};

export const SHADOWS = {
  soft: {
    shadowColor: '#534AB7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  medium: {
    shadowColor: '#534AB7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  strong: {
    shadowColor: '#26215C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
};