import { APCAcontrast, sRGBtoY } from '../../util/color/apca';
import { rgbFromHex } from '../../util/color/conversion';
import { ThemeDefinition } from './types';

export function createThemes(options: Record<string, any>) {
  const acc: Record<'light' | 'dark' | string, ThemeDefinition> = {};

  for (const [themeKey, themeOptions] of Object.entries(options)) {
    const theme = (acc[themeKey] = {
      ...themeOptions,
      colors: {
        ...themeOptions.colors,
      },
      variables: {
        ...themeOptions.variables,
      },
    });

    for (const colorName of Object.keys(theme.colors)) {
      const color = theme.colors[colorName];
      if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})/i.test(color)) {
        theme.colors[colorName] = color;
        theme.colors[`${colorName}-rgb`] = rgbFromHex(color)?.join(', ');
      }

      if (/^on-[a-z]/.test(colorName) || theme.colors[`on-${colorName}`])
        continue;

      const onColor = `on-${colorName}`;
      const colorY = sRGBtoY(rgbFromHex(color!) ?? [0, 0, 0]);

      const blackContrast = Math.abs(
        APCAcontrast(sRGBtoY([0, 0, 0]), colorY) as number,
      );
      const whiteContrast = Math.abs(
        APCAcontrast(sRGBtoY([255, 255, 255]), colorY) as number,
      );

      // Prefer white text if both have an acceptable contrast ratio
      theme.colors[onColor] =
        whiteContrast > Math.min(blackContrast, 50) ? '#ffffff' : '#000000';
      theme.colors[`${onColor}-rgb`] =
        whiteContrast > Math.min(blackContrast, 50)
          ? '255, 255, 255'
          : '0, 0, 0';
    }
  }

  return acc;
}

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
