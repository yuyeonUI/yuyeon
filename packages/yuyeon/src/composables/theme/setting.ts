import { mergeDeep } from '@/util/common';

import type { PaletteOption, ThemeOptions } from './types';

export const ThemeScheme = {
  light: 'light',
  dark: 'dark',
} as const;

export const schemes = ['light', 'dark', 'auto'] as const;

export const defaultTonalLuminance = [
  0, 10, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100,
];

export const defaultPalette: PaletteOption = {
  scaleMethod: 'tonal',
  colors: {
    primary: '#0062a1',
    secondary: '#6251a6',
    tertiary: '#3c691b',
    neutral: '#5d5e61',
    positive: '#009d61',
    negative: '#ba1a1a',
    warning: '#f69400',
    info: '#0d62e6',
  },
};

export const defaultThemesValues: any = {
  light: {
    isDark: false,
    colors: {
      primary: '#0062a1',
      secondary: '#6251a6',
      tertiary: '#3c691b',
      background: '#fdfbff',
      'on-background': '#1a1c1e',
      surface: '#fdfbff',
      'on-surface': '#1a1c1e',
      'surface-variant': '#dfe3eb',
      'on-surface-variant': '#42474e',
      outline: '#73777f',
      'outline-variant': '#c2c7cf',
      error: '#ba1a1a',
      'on-error': '#ffffff',
      warning: '#8a5100',
      'on-warning': '#ffffff',
      info: '#0056d0',
      'on-info': '#ffffff',
      success: '#006d42',
      'on-success': '#ffffff',
      shadow: '#000000',
      highlighter: '#ffff00',
    },
    variables: {
      'outline-opacity': 0.14,
      'base-shadow-opacity': 0.14,
      'base-font': '#141414',
    },
  },
  dark: {
    isDark: true,
    colors: {
      primary: '#9ccaff',
      'on-primary': '#003257',
      secondary: '#cbbeff',
      'on-secondary': '#332074',
      tertiary: '#a1d57a',
      'on-tertiary': '#173800',
      background: '#1a1c1e',
      'on-background': '#e2e2e6',
      surface: '#1a1c1e',
      'on-surface': '#e2e2e6',
      'surface-variant': '#42474e',
      'on-surface-variant': '#c2c7cf',
      outline: '#8c9199',
      'outline-variant': '#42474e',
      error: '#ffb4ab',
      'on-error': '#690005',
      warning: '#ffb86e',
      'on-warning': '#492900',
      info: '#b1c5ff',
      'on-info': '#002c72',
      success: '#61dd9a',
      'on-success': '#003920',
      shadow: '#000000',
      highlighter: '#51510d',
    },
    variables: {
      'outline-opacity': 0.14,
      'base-shadow-opacity': 0.14,
      'base-font': '#f5f5f5',
    },
  },
};

export function configureOptions(options?: ThemeOptions): any {
  if (!options) {
    return {
      scheme: ThemeScheme.light,
      theme: ['light', 'dark'],
      themes: { ...mergeDeep(defaultThemesValues) },
      palette: { ...mergeDeep(defaultPalette) },
    };
  }
  return {
    scheme: schemes.includes(options.scheme)
      ? options.scheme
      : ThemeScheme.light,
    theme: options.theme ?? ['light', 'dark'],
    themes: { ...mergeDeep(defaultThemesValues, options.themes) },
    palette: { ...mergeDeep(defaultPalette, options.palette) },
    separation: options?.separation,
  };
}
