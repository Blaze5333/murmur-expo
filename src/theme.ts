import { Platform } from 'react-native';

export const colors = {
  canvas: '#F5F6F8',
  paper: '#FFFFFF',
  ink: '#191D24',
  muted: '#727985',
  subtle: '#9299A4',
  line: '#E5E7EB',
  sage: '#E8EDFF',
  lime: '#DCE4FF',
  forest: '#315BEE',
  soft: '#F0F2F5',
};

// System fonts stay crisp on iOS, Android, and the web, even offline.
const family =
  Platform.OS === 'web'
    ? '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    : Platform.OS === 'android'
      ? 'sans-serif'
      : 'System';

export const fonts = {
  regular: family,
  medium: family,
  semibold: family,
  bold: family,
  display: family,
  italic: family,
};
