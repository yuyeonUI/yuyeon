import {
  computed,
  type CSSProperties,
  nextTick,
  onScopeDispose,
  type Ref,
  ref,
  watch,
} from 'vue';

import {
  type Anchor,
  BLOCK,
  flipSide,
  getAxis,
  parseAnchor,
  type ParsedAnchor,
  toPhysical,
} from '@/util/anchor';
import { includes } from '@/util/array';
import { $computed } from '@/util/reactivity';

import type { CoordinateState } from './types';
import { getBoundingPureRect, toStyleSizeValue } from '@/util/ui';

type BenchSide = 'top' | 'right' | 'bottom' | 'left';
type BenchAlign = 'start' | 'center' | 'end' | 'top' | 'bottom';

type Optional<T> = T | undefined;

export function applyArrangement(
  props: any,
  state: CoordinateState,
  coordination: Ref<any>,
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

  let observe = false;
  const resizeObserver = new ResizeObserver(() => {
    if (observe) updateCoordinate();
  });

  watch(
    state.contentEl,
    (neo, old) => {
      if (old) resizeObserver.unobserve(old);
      if (neo) resizeObserver.observe(neo);
    },
    { immediate: true },
  );

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

  onScopeDispose(() => {
    resizeObserver.disconnect();
  });

  function updateCoordinate(): any {
    const $content = state.contentEl.value;

    if (!$content) return;

    const contentRect = getIgnoreInsetRect($content);

    const placement = {
      anchor: preferredAnchor.value,
      origin: preferredOrigin.value,
    };
    const { side, align } = placement.anchor as {
      side: BenchSide;
      align: BenchAlign;
    };
    const axis = getAxis(placement.anchor); // !Perpendicular relation
    const available = { x: 0, y: 0 };
    const insetProps = {
      top: undefined,
      bottom: undefined,
      left: undefined,
      right: undefined,
    } as Record<BenchSide, Optional<number>>;
    if (axis === 'x') {
      insetProps.top = 0;
      insetProps.bottom = 0;
      insetProps[side] = 0;
    } else {
      insetProps.left = 0;
      insetProps.right = 0;
      insetProps[side] = 0;
    }

    Object.assign(coordinateStyles.value, {
      transformOrigin: `${placement.origin.side} ${placement.origin.align}`,
      // top: toStyleSizeValue(pixelRound(y)),
      // bottom: 0,
      // left: isRtl.value ? undefined : toStyleSizeValue(pixelRound(x)),
      // right: isRtl.value ? toStyleSizeValue(pixelRound(-x)) : undefined,
      ...insetProps,

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

    Object.assign(coordination.value, {
      side: placement.anchor.side,
      align: placement.anchor.align,
      rect: {
        x: 0,
        y: 0,
        width: contentRect.width,
        height: contentRect.height,
      },
    });

    return {
      available,
      placement,
      contentRect,
    };
  }

  function getIgnoreInsetRect(el: HTMLElement) {
    const rect = getBoundingPureRect(el);
    rect.x -= parseFloat(el.style.left || '0');
    rect.y -= parseFloat(el.style.top || '0');
    return rect;
  }

  nextTick(() => {
    const result = updateCoordinate();
    if (!result) return;
    const { available, contentRect } = result;
    if (contentRect.height > available.y) {
      requestAnimationFrame(() => {
        updateCoordinate();
        requestAnimationFrame(() => {
          updateCoordinate();
        });
      });
    }
  });

  return {
    updateCoordinate,
    preferredAnchor,
    preferredOrigin,
  };
}
