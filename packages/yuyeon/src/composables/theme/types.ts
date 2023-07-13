import { ThemeScheme } from "./setting";

export interface ThemeOptions {
  scheme: 'light' | 'dark' | 'auto';
  theme: [string, string?];
  themes: Record<string, ThemeDefinition>;
  palette?: PaletteOption;
  cspNonce?: string;
}

export interface PaletteOption {
  scaleMethod: 'manual' | 'luma' | 'tonal';
  colors: Record<string, string | PaletteLevelColorOption | PaletteLumaColorOption>;
  defaultLamaScale?: {
    darken?: 0 | 1 | 2 | 3 | 4;
    lighten?: 0 | 1 | 2 | 3 | 4 | 5;
  }
}

type ScaleLevel = number;
export type PaletteLevelColorOption = Record<ScaleLevel, string>

export type PaletteLumaColorOption = {
  value: string,
  darken?: 0 | 1 | 2 | 3 | 4;
  lighten?: 0 | 1 | 2 | 3 | 4 | 5;
}

export interface ThemeDefinition {
  isDark: boolean;
  colors: Record<string, string>;
  variables: Record<string, string>;
}
