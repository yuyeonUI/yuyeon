/*
 * Created by yeonyu 2022.
 */

export function isOverflow(e: HTMLElement): boolean {
  return e.offsetWidth < e.scrollWidth;
}

export function colorHexToRgb(color: string): number[] | undefined {
  if (color && color[0] === '#') {
    const hexCodeStr = color.substring(1, color.length);
    const hexCodeLength = hexCodeStr.length;
    const rgbValues = [];
    if (hexCodeLength === 3 || hexCodeLength === 6) {
      const multiple = hexCodeLength === 6 ? 2 : 1;
      for (let i = 0; i < 3; i += 1) {
        const hexCode = hexCodeStr.substring(
          i * multiple,
          i * multiple + multiple,
        );
        rgbValues.push(Number.parseInt(hexCode, 16));
      }
      return rgbValues;
    }
  }
  return undefined;
}

export function textColorIsLight(r: number, g: number, b: number): boolean {
  const luminance = 1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

export const RGBA_REGEX = /rgb(a?)\((?<v>.*)\)/;
export const HEX_COLOR_REGEX = /#([0-9a-fA-F]{3,6,8})/;

export function isColorValue(value: string): boolean {
  return RGBA_REGEX.test(value) || HEX_COLOR_REGEX.test(value);
}
