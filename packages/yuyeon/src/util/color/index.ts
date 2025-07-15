/*
* yuyeon
* Apache-2.0 license (Copyright 2023 yeonyew)
*
* Used Libs
* - material-color-utilities
*   Apache-2.0 license (Copyright 2021 Google LLC)
*   https://github.com/material-foundation/material-color-utilities
*
* - Vuetify
*   MIT license (Copyright (c) 2016-2023 John Jeremy Leider)
*   https://github.com/vuetifyjs/vuetify
* */

import { HEX_COLOR_REGEX, RGBA_REGEX } from "./const";
import { rgbFromHex } from './conversion';

export function isColorValue(value: string): boolean {
  return RGBA_REGEX.test(value) || HEX_COLOR_REGEX.test(value);
}

export function colorRgb(color: string): string {
  if (color?.startsWith('#')) {
    return rgbFromHex(color)?.join(',') || '';
  }
  const RGBA_REGEX = /rgb(a?)\((?<v>.*)\)/;
  if (RGBA_REGEX.test(color)) {
    const value = RGBA_REGEX.exec(color)?.[2] || '';
    if (value) {
      const valueArray = value.trim().split(',');
      valueArray.splice(3, 1);
      return valueArray.join(',');
    }
  }
  return '';
}

export function isTextColorIsLight(r: number, g: number, b: number): boolean {
  const luminance = 1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

export * from './const';
export * from "./conversion";
