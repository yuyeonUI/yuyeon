import { includes } from './array';

export const BLOCK = ['top', 'bottom'] as const;
export const INLINE = ['start', 'end', 'left', 'right'] as const;
export type Tblock = (typeof BLOCK)[number];
export type Tinline = (typeof INLINE)[number];
export type Anchor =
  | Tblock
  | Tinline
  | 'center'
  | 'center center'
  | `${Tblock} ${Tinline | 'center'}`
  | `${Tinline} ${Tblock | 'center'}`;
export type ParsedAnchor =
  | { side: 'center'; align: 'center' }
  | { side: Tblock; align: 'left' | 'right' | 'center' }
  | { side: 'left' | 'right'; align: Tblock | 'center' };

/** Parse a raw anchor string into an object */
export function parseAnchor(anchor: Anchor, isRtl: boolean) {
  let [side, align] = anchor.split(' ') as [
    Tblock | Tinline | 'center',
    Tblock | Tinline | 'center' | undefined,
  ];
  if (!align) {
    align = includes(BLOCK, side)
      ? 'start'
      : includes(INLINE, side)
        ? 'top'
        : 'center';
  }

  return {
    side: toPhysical(side, isRtl),
    align: toPhysical(align, isRtl),
  } as ParsedAnchor;
}

export function toPhysical(str: 'center' | Tblock | Tinline, isRtl: boolean) {
  if (str === 'start') return isRtl ? 'right' : 'left';
  if (str === 'end') return isRtl ? 'left' : 'right';
  return str;
}

export function flipSide(anchor: ParsedAnchor) {
  return {
    side: {
      center: 'center',
      top: 'bottom',
      bottom: 'top',
      left: 'right',
      right: 'left',
    }[anchor.side],
    align: anchor.align,
  } as ParsedAnchor;
}

export function flipAlign(anchor: ParsedAnchor) {
  return {
    side: anchor.side,
    align: {
      center: 'center',
      top: 'bottom',
      bottom: 'top',
      left: 'right',
      right: 'left',
    }[anchor.align],
  } as ParsedAnchor;
}

export function flipCorner(anchor: ParsedAnchor) {
  return {
    side: anchor.align,
    align: anchor.side,
  } as ParsedAnchor;
}

export function getAxis(anchor: ParsedAnchor) {
  return includes(BLOCK, anchor.side) ? 'y' : 'x';
}
