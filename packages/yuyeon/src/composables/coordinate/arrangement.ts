import { computed, type CSSProperties, type Ref, ref, watch } from 'vue';

import {
  type Anchor,
  BLOCK,
  flipSide,
  type ParsedAnchor,
  parseAnchor,
  toPhysical,
  getAxis,
} from '@/util/anchor';
import { includes } from '@/util/array';
import { clamp } from '@/util/common';
import { $computed } from '@/util/reactivity';
import type { Rect } from '@/util/rect';

import type { CoordinateState } from './types';
import { pixelCeil, pixelRound, toStyleSizeValue } from '@/util/ui';

type BenchSide = 'top' | 'right' | 'bottom' | 'left';
type BenchAlign = 'start' | 'center' | 'end' | 'top' | 'bottom';

export function applyArrangement(
  props: any,
  state: CoordinateState,
  coordinate: Ref<Rect | undefined>,
  coordinateStyles: Ref<CSSProperties>,
) {
  const isRtl = ref(false);

  const [minWidth, minHeight, maxWidth, maxHeight] = (
    ['minWidth', 'minHeight', 'maxWidth', 'maxHeight'] as const
  ).map((key) => {
    return computed(() => {
      const val = parseFloat(props[key] as string);
      return Number.isNaN(val) ? Infinity : val;
    });
  });

  const { preferredAnchor, preferredOrigin } = $computed(() => {
    const side = toPhysical(
      (props.position ?? 'right') as BenchSide | 'start' | 'end',
      isRtl.value,
    ) as BenchSide;

    const isBlockSide = includes(BLOCK, side); // side === 'top' | 'bottom'

    const rawAlign: BenchAlign = props.align ?? (isBlockSide ? 'start' : 'top');
    const align = toPhysical(rawAlign, isRtl.value);

    const parsedAnchor = {
      side,
      align,
    } as ParsedAnchor;
    const parsedOrigin: ParsedAnchor =
      props.origin === 'overlap'
        ? parsedAnchor
        : props.origin === 'auto'
          ? flipSide(parsedAnchor)
          : parseAnchor(props.origin as Anchor, false);

    return {
      preferredAnchor: parsedAnchor,
      preferredOrigin: parsedOrigin,
    };
  });

  watch(
    () => [
      props.offset,
      props.minWidth,
      props.minHeight,
      props.maxWidth,
      props.maxHeight,
      preferredAnchor.value,
      preferredOrigin.value,
    ],
    () => updateCoordinate(),
  );

  function updateCoordinate(): any {
    const placement = {
      anchor: preferredAnchor.value,
      origin: preferredOrigin.value,
    };
    const axis = getAxis(placement.anchor);
    const available = { x: 0, y: 0 };
    let x = 0;
    let y = 0;

    Object.assign(coordinateStyles.value, {
      transformOrigin: `${placement.origin.side} ${placement.origin.align}`,
      // top: toStyleSizeValue(pixelRound(y)),
      // bottom: 0,
      // left: isRtl.value ? undefined : toStyleSizeValue(pixelRound(x)),
      // right: isRtl.value ? toStyleSizeValue(pixelRound(-x)) : undefined,

      minWidth: toStyleSizeValue(
        axis === 'y' ? Math.min(minWidth.value, 0) : minWidth.value,
      ),
      // maxWidth: toStyleSizeValue(
      //   pixelCeil(
      //     clamp(
      //       available.x,
      //       minWidth.value === Infinity ? 0 : minWidth.value,
      //       maxWidth.value,
      //     ),
      //   ),
      // ),
      // maxHeight: toStyleSizeValue(
      //   pixelCeil(
      //     clamp(
      //       available.y,
      //       minHeight.value === Infinity ? 0 : minHeight.value,
      //       maxHeight.value,
      //     ),
      //   ),
      // ),
    });
  }

  return {
    updateCoordinate,
  };
}
