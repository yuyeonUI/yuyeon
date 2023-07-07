import { PaletteOption, ThemeOptions } from "./types";

import { mergeDeep } from '../../util/common';

export const ThemeScheme = {
  light: 'light',
  dark: 'dark',
} as const;

export const defaultPalette: PaletteOption = {
  scaleMethod: 'tonal',
  colors: {
    primary: '#0062a1',
    secondary: '#6251a6',
    tertiary: '#3c691b',
    neutral: '#5d5e61',
    positive: '#42ba1a',
    negative: '#ba1a1a',
    warning: '#d09220',
  }
};

export const defaultThemesValues: any = {
  light: {
    scheme: ThemeScheme.light,
    colors: {
      primary: '#0062a1',
      secondary: '#6251a6',
      tertiary: '#3c691b',
      background: '#fdfbff',
      surface: '#fdfbff',
      'surface-variant': '#dfe3eb',
      outline: '#73777f',
      error: '#ba1a1a',
    },
    variables: {
      'base-shadow-opacity': 0.14,
      'base-font': '#141414',
    },
  },
  dark: {
    scheme: ThemeScheme.dark,
    colors: {
      primary: '#9ccaff',
      secondary: '#cbbeff',
      tertiary: '#a1d57a',
      background: '#001b3d',
      surface: '#001b3d',
      'surface-variant': '#42474e',
      outline: '#8c9199',
      error: '#ffb4ab',
    },
    variables: {
      'base-shadow-opacity': 0.14,
      'base-font': '#fff',
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
    scheme: ThemeScheme.light,
    theme: ['light', 'dark'],
    themes: { ...mergeDeep(defaultThemesValues, options.themes) },
    palette: { ...mergeDeep(defaultPalette, options.palette) },
  };
}
