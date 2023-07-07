import { ThemeDefinition } from './types';

import { argbFromRgb, colorHexToRgb, rgbaFromArgb } from "../../util/color";
import { APCAcontrast, sRGBtoY } from '../../util/color/apca';
import { TonalPalette } from '../../util/color/palettes/tonal_palette';

export function createThemes(options: Record<string, any>) {
  const acc: Record<'light' | 'dark' | string, ThemeDefinition> = {};

  for (const [themeKey, themeOptions] of Object.entries(options)) {
    const theme = (acc[themeKey] = {
      ...themeOptions,
      colors: {
        ...themeOptions.colors,
      },
    });

    const keyColor = TonalPalette.fromInt(
      argbFromRgb(...(colorHexToRgb('#FF62a1') as [number, number, number])),
      //#d09220
    );
    console.log(rgbaFromArgb(keyColor.tone(40)));

    for (const color of Object.keys(theme.colors)) {
      if (/^on-[a-z]/.test(color) || theme.colors[`on-${color}`]) continue;

      const onColor = `on-${color}`;
      const colorVal = sRGBtoY(
        colorHexToRgb(theme.colors[color]!) ?? [0, 0, 0],
      );

      const blackContrast = Math.abs(
        APCAcontrast(sRGBtoY([0, 0, 0]), colorVal) as number,
      );
      const whiteContrast = Math.abs(
        APCAcontrast(sRGBtoY([255, 255, 255]), colorVal) as number,
      );

      // Prefer white text if both have an acceptable contrast ratio
      theme.colors[onColor] =
        whiteContrast > Math.min(blackContrast, 50) ? '#fff' : '#000';
    }
  }

  return acc;
}

const defaultLuminance = [
  0, 10, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100,
];

export function createPalette(options: Record<string, string | any>) {
  const acc: Record<string, string> = {};
  const { scaleMethod, colors } = options;
  for (const [colorName, value] of Object.entries(colors)) {
    if (typeof value === 'string') {
      acc[colorName] = value;
    }
  }
  return acc;
}
