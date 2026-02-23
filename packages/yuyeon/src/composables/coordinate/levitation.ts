import type { CSSProperties, Ref } from 'vue';
import { computed, nextTick, onScopeDispose, ref, watch } from 'vue';

import {
  type Anchor,
  flipAlign,
  flipCorner,
  flipSide,
  getAxis,
  parseAnchor,
} from '@/util/anchor';
import { clamp } from '@/util/common';
import { $computed } from '@/util/reactivity';
import { getOverflow, MutableRect } from '@/util/rect';
import { getScrollParents } from '@/util/scroll';
import {
  getBoundingPureRect,
  pixelCeil,
  pixelRound,
  toStyleSizeValue,
} from '@/util/ui';

import type { CoordinateState } from './types';
import { anchorToPoint, getOffset } from './utils/point';

export function applyLevitation(
  props: any,
  state: CoordinateState,
  coordination: Ref<any>,
  coordinateStyles: Ref<CSSProperties>,
) {
  const { contentEl, base } = state;

  const isRtl = ref(false);
  const isFlipped = ref([false, false]);

  /* Content Limitations */
  const [minWidth, minHeight, maxWidth, maxHeight] = (
    ['minWidth', 'minHeight', 'maxWidth', 'maxHeight'] as const
  ).map((key) => {
    return computed(() => {
      const val = parseFloat(props[key] as string);
      return Number.isNaN(val) ? Infinity : val;
    });
  });

  const { preferredAnchor, preferredOrigin } = $computed(() => {
    const location = `${props.position} ${props.align}` as Anchor;
    const parsedAnchor = parseAnchor(location, false);
    const parsedOrigin =
      props.origin === 'overlap'
        ? parsedAnchor
        : props.origin === 'auto'
          ? flipSide(parsedAnchor)
          : parseAnchor(props.origin, false);

    // Some combinations of props may produce an invalid origin
    if (
      parsedAnchor.side === parsedOrigin.side &&
      parsedAnchor.align === flipAlign(parsedOrigin).align
    ) {
      return {
        preferredAnchor: flipCorner(parsedAnchor),
        preferredOrigin: flipCorner(parsedOrigin),
      };
    } else {
      return {
        preferredAnchor: parsedAnchor,
        preferredOrigin: parsedOrigin,
      };
    }
  });

  /* Offset */
  const offset = computed(() => {
    return parseCoordProp(props.offset);
  });

  /* Viewport Margin */
  const viewportMargin = computed(() => {
    return parseCoordProp(props.viewportMargin);
  });

  /* Observing Update */
  let observe = false;
  const resizeObserver = new ResizeObserver(() => {
    if (observe) updateCoordinate();
  });

  watch(
    [state.base, state.contentEl],
    ([neoBaseEl, neoContentEl], [oldBaseEl, oldContentEl]) => {
      if (oldBaseEl && !Array.isArray(oldBaseEl) && oldBaseEl.nodeType === 1)
        resizeObserver.unobserve(oldBaseEl);
      if (neoBaseEl && !Array.isArray(neoBaseEl) && neoBaseEl.nodeType === 1)
        resizeObserver.observe(neoBaseEl);

      if (oldContentEl) resizeObserver.unobserve(oldContentEl);
      if (neoContentEl) resizeObserver.observe(neoContentEl);
    },
    { immediate: true },
  );

  onScopeDispose(() => {
    resizeObserver.disconnect();
  });

  function getIgnoreInsetRect(el: HTMLElement) {
    const rect = getBoundingPureRect(el);
    rect.x -= parseFloat(el.style.left || '0');
    rect.y -= parseFloat(el.style.top || '0');
    return rect;
  }

  function updateCoordinate(): any {
    observe = false;
    const $base = base.value;
    const $content = contentEl.value;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        observe = true;
      });
    });

    if (!$base || !$content) return;

    const baseRect = Array.isArray($base)
      ? new MutableRect({
          x: $base?.[0] ?? 0,
          y: $base?.[1] ?? 0,
          width: 0,
          height: 0,
        })
      : $base.getBoundingClientRect();
    const contentRect = getIgnoreInsetRect($content);
    const scrollParents = getScrollParents($content);

    if (scrollParents.length < 1) {
      scrollParents.push(document.documentElement);
    }

    /**
     * Viewport area
     */
    const viewport = scrollParents.reduce<MutableRect>(
      (box: MutableRect | undefined, el) => {
        const rect = el.getBoundingClientRect();
        const scrollBox = new MutableRect({
          x: el === document.documentElement ? 0 : rect.x,
          y: el === document.documentElement ? 0 : rect.y,
          width: el.clientWidth,
          height: el.clientHeight,
        });

        if (box) {
          return new MutableRect({
            x: Math.max(box.left, scrollBox.left),
            y: Math.max(box.top, scrollBox.top),
            width:
              Math.min(box.right, scrollBox.right) -
              Math.max(box.left, scrollBox.left),
            height:
              Math.min(box.bottom, scrollBox.bottom) -
              Math.max(box.top, scrollBox.top),
          });
        }
        return scrollBox;
      },
      undefined!,
    );
    viewport.x += viewportMargin.value[0];
    viewport.y += viewportMargin.value[1];
    viewport.width -= viewportMargin.value[0] * 2;
    viewport.height -= viewportMargin.value[1] * 2;

    let placement = {
      anchor: preferredAnchor.value,
      origin: preferredOrigin.value,
    };

    function checkOverflow(_placement: typeof placement) {
      const box = new MutableRect(contentRect);
      const targetPoint = anchorToPoint(_placement.anchor, baseRect);
      const contentPoint = anchorToPoint(_placement.origin, box);

      let { x, y } = getOffset(targetPoint, contentPoint);

      switch (_placement.anchor.side) {
        case 'top':
          y -= offset.value[0];
          break;
        case 'bottom':
          y += offset.value[0];
          break;
        case 'left':
          x -= offset.value[0];
          break;
        case 'right':
          x += offset.value[0];
          break;
      }

      switch (_placement.anchor.align) {
        case 'top':
          y -= offset.value[1];
          break;
        case 'bottom':
          y += offset.value[1];
          break;
        case 'left':
          x -= offset.value[1];
          break;
        case 'right':
          x += offset.value[1];
          break;
        case 'center': {
          if (
            _placement.anchor.side === 'top' ||
            _placement.anchor.side === 'bottom'
          ) {
            x += offset.value[1];
          } else {
            y += offset.value[1];
          }
          break;
        }
      }

      box.x += x;
      box.y += y;

      box.width = Math.min(box.width, maxWidth.value);
      box.height = Math.min(box.height, maxHeight.value);

      const overflows = getOverflow(box, viewport);

      return { overflows, x, y };
    }

    let x = 0;
    let y = 0;
    const available = { x: 0, y: 0 };
    const flipped = { x: false, y: false };
    let resets = -1;
    while (true) {
      if (resets++ > 10) {
        break;
      }

      const { x: _x, y: _y, overflows } = checkOverflow(placement);

      x += _x;
      y += _y;

      contentRect.x += _x;
      contentRect.y += _y;

      // flip
      {
        const axis = getAxis(placement.anchor);
        const hasOverflowX = overflows.x.before || overflows.x.after;
        const hasOverflowY = overflows.y.before || overflows.y.after;

        let reset = false;
        ['x', 'y'].forEach((key) => {
          if (
            (key === 'x' && hasOverflowX && !flipped.x) ||
            (key === 'y' && hasOverflowY && !flipped.y)
          ) {
            const newPlacement = {
              anchor: { ...placement.anchor },
              origin: { ...placement.origin },
            };
            const flip =
              key === 'x'
                ? axis === 'y'
                  ? flipAlign
                  : flipSide
                : axis === 'y'
                  ? flipSide
                  : flipAlign;
            newPlacement.anchor = flip(newPlacement.anchor);
            newPlacement.origin = flip(newPlacement.origin);
            const { overflows: newOverflows } = checkOverflow(newPlacement);
            if (
              (newOverflows[key].before <= overflows[key].before &&
                newOverflows[key].after <= overflows[key].after) ||
              newOverflows[key].before + newOverflows[key].after <
                (overflows[key].before + overflows[key].after) / 2
            ) {
              placement = newPlacement;
              reset = flipped[key] = true;
            }
          }
        });
        if (reset) continue;
      }

      // shift
      if (overflows.x.before) {
        x += overflows.x.before;
        contentRect.x += overflows.x.before;
      }
      if (overflows.x.after) {
        x -= overflows.x.after;
        contentRect.x -= overflows.x.after;
      }
      if (overflows.y.before) {
        y += overflows.y.before;
        contentRect.y += overflows.y.before;
      }
      if (overflows.y.after) {
        y -= overflows.y.after;
        contentRect.y -= overflows.y.after;
      }

      // size
      {
        const overflows = getOverflow(contentRect, viewport);
        available.x = viewport.width - overflows.x.before - overflows.x.after;
        available.y = viewport.height - overflows.y.before - overflows.y.after;

        x += overflows.x.before;
        contentRect.x += overflows.x.before;
        y += overflows.y.before;
        contentRect.y += overflows.y.before;
      }

      break;
    }

    const axis = getAxis(placement.anchor);

    coordination.value = {
      side: placement.anchor.side,
      align: placement.anchor.align,
      rect: new MutableRect({
        x,
        y,
        width: contentRect.width,
        height: contentRect.height,
      }),
      offset: [0, 0],
    };

    Object.assign(coordinateStyles.value, {
      '--y-levitation-anchor-origin': `${placement.anchor.side} ${placement.anchor.align}`,
      transformOrigin: `${placement.origin.side} ${placement.origin.align}`,
      top: toStyleSizeValue(pixelRound(y)),
      left: isRtl.value ? undefined : toStyleSizeValue(pixelRound(x)),
      right: isRtl.value ? toStyleSizeValue(pixelRound(-x)) : undefined,
      minWidth: toStyleSizeValue(
        axis === 'y'
          ? Math.min(minWidth.value, baseRect.width)
          : minWidth.value,
      ),
      maxWidth: toStyleSizeValue(
        pixelCeil(
          clamp(
            available.x,
            minWidth.value === Infinity ? 0 : minWidth.value,
            maxWidth.value,
          ),
        ),
      ),
      maxHeight: toStyleSizeValue(
        pixelCeil(
          clamp(
            available.y,
            minHeight.value === Infinity ? 0 : minHeight.value,
            maxHeight.value,
          ),
        ),
      ),
    });

    isFlipped.value = [flipped.x, flipped.y];

    return {
      available,
      contentRect,
      flipped,
      placement,
    };
  }

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
    isFlipped,
    preferredAnchor,
    preferredOrigin,
  };
}

function parseCoordProp(prop: string | number | (string | number)[]) {
  let margins: number[];
  if (typeof prop === 'string') {
    margins = prop.split(' ').map(parseFloat);
    if (margins.length === 1) margins.push(margins[0]);
  } else if (Array.isArray(prop)) {
    margins = (prop as string[]).map(parseFloat);
  } else {
    margins = [prop, prop];
  }

  return margins.slice(0, 2).map((v) => (Number.isNaN(v) ? 0 : v));
}
