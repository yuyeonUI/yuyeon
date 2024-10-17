import { type CSSProperties, type Ref } from 'vue';

import { type Rect } from '@/util/rect';

import type { CoordinateState } from './types';

export function applyArrangement(
  props: any,
  state: CoordinateState,
  coordinate: Ref<Rect | undefined>,
  coordinateStyles: Ref<CSSProperties>,
) {
  const { contentEl, base, active } = state;

  function updateCoordinate(): any {
    //
  }

  return {
    updateCoordinate,
  };
}
