import { CustomTheme } from '../utils/themeUtils';

export interface ClientThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  brandName?: string;
  logo?: string;
}

export const generateClientTheme = (config: ClientThemeConfig): CustomTheme => {
  const theme: CustomTheme = {};

  if (config.primaryColor) {
    theme.primary = hexToRgb(config.primaryColor);
  }

  if (config.secondaryColor) {
    theme.secondary = hexToRgb(config.secondaryColor);
  }

  return theme;
};

const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0 0 0';
  
  return `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`;
};

export const presetClientThemes = {
  blue: generateClientTheme({
    primaryColor: '#3758F9',
    secondaryColor: '#64748b',
  }),
  green: generateClientTheme({
    primaryColor: '#10b981',
    secondaryColor: '#6b7280',
  }),
  purple: generateClientTheme({
    primaryColor: '#8b5cf6',
    secondaryColor: '#6b7280',
  }),
  orange: generateClientTheme({
    primaryColor: '#f97316',
    secondaryColor: '#6b7280',
  }),
};


