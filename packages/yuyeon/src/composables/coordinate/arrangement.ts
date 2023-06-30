import type { CSSProperties, Ref } from 'vue';

import { Rect } from '../../util/Rect';

import { CoordinateState } from './types';

export function applyArrangement(
  props: any,
  state: CoordinateState,
  coordinate: Ref<Rect | undefined>,
  coordinateStyles: Ref<CSSProperties>,
) {
  const { contentEl, baseEl, active } = state;

  function updateCoordinate(): any {
    //
  }

  return {
    updateCoordinate,
  };
}
