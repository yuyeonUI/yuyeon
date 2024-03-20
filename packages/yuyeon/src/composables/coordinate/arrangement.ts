import type { CSSProperties, Ref } from 'vue';

import { Rect } from '../../util/rect';

import { CoordinateState } from './types';

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
