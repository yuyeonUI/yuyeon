import { mergeDeep } from "../../util/common";

export const ThemeScheme = {
  light: 'light',
  dark: 'dark',
} as const;

export interface ThemeOptions {
  mode: 'manual';
  scheme: keyof typeof ThemeScheme | 'normal';
  theme: string | [string, string];
  themes: any;
}

export const defaultThemesValues: any = {
  light: {
    scheme: ThemeScheme.light,
    colors: {
      'app-background': '#ffffff',
      'base-font': '#141414',
    },
    variables: {
      'base-shadow-opacity': 0.14
    },
  },
  dark: {
    scheme: ThemeScheme.dark,
    colors: {
      'app-background': '#1e1e1e',
      'base-font': '#fff',
    },
    variables: {
      'base-shadow-opacity': 0.14
    },
  },
};

export function configureOptions (options?: ThemeOptions): any {
  if (!options) {
    return {
      scheme: 'normal',
      theme: ['light', 'dark'],
      themes: {...mergeDeep(defaultThemesValues)},
    }
  }
  return {
    scheme: ThemeScheme.light,
    theme: ['light', 'dark'],
    themes: {...mergeDeep(defaultThemesValues, options.themes)},
  }
}
