import { ThemeScheme } from "./setting";

export interface ThemeOptions {
  mode: 'manual'; // TODO: 'auto' => apply [prefers-color-scheme]
  scheme: 'light' | 'dark' | 'normal';
  theme: string | [string, string];
  themes: any;
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
  scheme: keyof typeof ThemeScheme | 'normal';
  colors: Record<string, string>;
  variables: Record<string, string>;
}
