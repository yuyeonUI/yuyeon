

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

export function toStyleSizeValue(
  size: number | string | null | undefined,
  unit = 'px',
): string | undefined {
  if (size === '' || size === null || size === undefined) {
    return undefined;
  }
  let value = Number(size);
  if (isNaN(value) || !isFinite(value)) {
    return undefined;
  }
  return `${value}${unit}`;
}

export function getBoundingPureRect(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const style = getComputedStyle(el);
  const tx = style.transform;

  if (tx) {
    let sx, sy, dx, dy;
    if (tx.startsWith('matrix3d(')) {
      const ta = tx.slice(9, -1).split(/, /);
      sx = +ta[0];
      sy = +ta[5];
      dx = +ta[12];
      dy = +ta[13];
    } else if (tx.startsWith('matrix(')) {
      const ta = tx.slice(7, -1).split(/, /);
      sx = +ta[0];
      sy = +ta[3];
      dx = +ta[4];
      dy = +ta[5];
    } else {
      return rect;
    }

    const to = style.transformOrigin;
    const x = rect.x - dx - (1 - sx) * parseFloat(to);
    const y =
      rect.y - dy - (1 - sy) * parseFloat(to.slice(to.indexOf(' ') + 1));
    const w = sx ? rect.width / sx : el.offsetWidth;
    const h = sy ? rect.height / sy : el.offsetHeight;
    return {
      x: x,
      y: y,
      width: w,
      height: h,
      top: y,
      right: x + w,
      bottom: y + h,
      left: x,
    } as DOMRect;
  } else {
    return rect;
  }
}

export function pixelRound (val: number) {
  return Math.round(val * devicePixelRatio) / devicePixelRatio
}

export function pixelCeil (val: number) {
  return Math.ceil(val * devicePixelRatio) / devicePixelRatio
}
