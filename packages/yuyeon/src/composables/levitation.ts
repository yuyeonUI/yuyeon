import type { Ref } from 'vue';
import {
  CSSProperties,
  computed,
  nextTick,
  onScopeDispose,
  ref,
  watch,
} from 'vue';

import { getScrollParents } from '../util/scroll';
import { getBoundingPureRect, toStyleSizeValue } from '../util/ui';
import { useToggleScope } from './scope';
import { Rect } from "../util/Rect";

export interface LevitationState {
  contentEl: Ref<HTMLElement | undefined>;
  baseEl: Ref<HTMLElement | undefined>;
  active: Ref<boolean>;
}

const levitationStrategies = {
  levitation: applyLevitation,
};

export function useLevitation(props: any, state: LevitationState) {
  const updateLevitation = ref<(e: Event) => void>();
  const coordinate = ref<Rect | undefined>();
  const coordinateStyles = computed<CSSProperties>(() => {
    if (coordinate.value) {
      return {
        top: toStyleSizeValue(coordinate.value.y),
        left: toStyleSizeValue(coordinate.value.x),
      };
    }
    return {};
  });

  useToggleScope(
    () => !!(state.active.value && props.levitationStrategy),
    (reset) => {
      watch(() => props.levitationStrategy, reset);
      onScopeDispose(() => {
        updateLevitation.value = undefined;
      });

      if (typeof props.levitationStrategy === 'function') {
        updateLevitation.value = props.levitationStrategy(
          props,
          state,
          coordinate,
        )?.updateLevitation;
      } else {
        const strategy =
          levitationStrategies[
            props.levitationStrategy as keyof typeof levitationStrategies
          ];
        updateLevitation.value = strategy?.(
          props,
          state,
          coordinate,
        )?.updateLevitation;
      }
    },
  );

  window.addEventListener('resize', onResize, { passive: true });

  onScopeDispose(() => {
    window.removeEventListener('resize', onResize);
    updateLevitation.value = undefined;
  });

  function onResize(e: Event) {
    updateLevitation.value?.(e);
  }

  return {
    coordinate,
    coordinateStyles,
    updateLevitation,
  };
}

function applyLevitation(
  props: any,
  state: LevitationState,
  coordinate: Ref<Rect | undefined>,
) {
  const { contentEl, baseEl, active } = state;

  /* Content Limitations */
  const [minWidth, minHeight, maxWidth, maxHeight] = (
    ['minWidth', 'minHeight', 'maxWidth', 'maxHeight'] as const
  ).map((key) => {
    return computed(() => {
      const val = parseFloat(props[key]!);
      return isNaN(val) ? Infinity : val;
    });
  });

  /* Offset */
  const offset = computed(() => {
    if (Array.isArray(props.offset)) {
      return props.offset;
    }
    if (typeof props.offset === 'string') {
      const offset = props.offset.split(' ').map(parseFloat);
      if (offset.length < 2) offset.push(0);
      return offset;
    }
    return typeof props.offset === 'number' ? [props.offset, 0] : [0, 0];
  });

  /* Observing Update */
  let observe = false;
  const resizeObserver = new ResizeObserver(() => {
    if (observe) updateLevitation();
  });
  watch(
    [state.baseEl, state.contentEl],
    ([neoBaseEl, neoContentEl], [oldBaseEl, oldContentEl]) => {
      if (oldBaseEl) resizeObserver.unobserve(oldBaseEl);
      if (neoBaseEl) resizeObserver.observe(neoBaseEl);

      if (oldContentEl) resizeObserver.unobserve(oldContentEl);
      if (neoContentEl) resizeObserver.observe(neoContentEl);
    },
    { immediate: true },
  );
  onScopeDispose(() => {
    resizeObserver.disconnect();
  });

  function updateLevitation(): any {
    observe = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => (observe = true));
    });
    if (!baseEl.value || !contentEl.value) return;

    const $base = baseEl.value;
    const $content = contentEl.value;
    const { viewportMargin } = props;

    const baseRect = $base.getBoundingClientRect();
    const contentRect = getBoundingPureRect($content);
    const scrollParents = getScrollParents($content);

    if (scrollParents.length < 1) {
      scrollParents.push(document.documentElement);
    }

    let x = baseRect.top;
    let y = baseRect.left + baseRect.width / 2;
  }

  watch(
    () => [
      props.offset,
      props.minWidth,
      props.minHeight,
      props.maxWidth,
      props.maxHeight,
    ],
    () => updateLevitation(),
  );

  nextTick(() => {
    const result = updateLevitation();
    if (!result) return;
    const { available, contentBox } = result;
    if (contentBox.height > available.y) {
      requestAnimationFrame(() => {
        updateLevitation();
        requestAnimationFrame(() => {
          updateLevitation();
        });
      });
    }
  });

  return {
    updateLevitation,
  };
}
