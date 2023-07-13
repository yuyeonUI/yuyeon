import type { EffectScope, PropType, Ref } from 'vue';
import { effectScope, nextTick, onScopeDispose, watchEffect } from 'vue';

import { FrameScheduler } from '../../util/frame-scheduler';
import { getScrollParents, hasScrollbar } from '../../util/scroll';
import { toStyleSizeValue } from '../../util/ui';
import { propsFactory } from '../../util/vue-component';

const frameScheduler = new FrameScheduler();

export interface ScrollStrategyData {
  root: Ref<HTMLElement | undefined>;
  contentEl: Ref<HTMLElement | undefined>;
  baseEl: Ref<HTMLElement | undefined>;
  active: Ref<boolean>;
  updateLevitation: Ref<((e: Event) => void) | undefined>;
}

type ScrollStrategyFn = (
  data: ScrollStrategyData,
  props: StrategyProps,
  scope: EffectScope,
) => void;

const scrollStrategies = {
  none: null,
  close: closeScrollStrategy,
  block: blockScrollStrategy,
  reposition: repositionScrollStrategy,
};

export interface StrategyProps {
  scrollStrategy: keyof typeof scrollStrategies | ScrollStrategyFn;
  contained: boolean | undefined;
}

export const pressScrollStrategyProps = propsFactory(
  {
    scrollStrategy: {
      type: [String, Function] as PropType<StrategyProps['scrollStrategy']>,
      default: 'block',
      validator: (val: any) =>
        typeof val === 'function' || val in scrollStrategies,
    },
  },
  'YLayer__scroll-strategies',
);

export function useScrollStrategies(
  props: StrategyProps,
  data: ScrollStrategyData,
) {
  let scope: EffectScope | undefined;
  watchEffect(async () => {
    scope?.stop();

    if (!(data.active.value && props.scrollStrategy)) return;

    scope = effectScope();
    await nextTick();
    scope.active &&
      scope.run(() => {
        if (typeof props.scrollStrategy === 'function') {
          props.scrollStrategy(data, props, scope!);
        } else {
          scrollStrategies[props.scrollStrategy]?.(data, props, scope!);
        }
      });
  });

  onScopeDispose(() => {
    scope?.stop();
  });
}

function closeScrollStrategy(data: ScrollStrategyData) {
  function onScroll(e: Event) {
    data.active.value = false;
  }

  bindScroll(data.baseEl.value ?? data.contentEl.value, onScroll);
}

const BLOCKER_LAYER_CLASS = 'y-layer--scroll-blocked';
const BLOCKER_CLASS = 'y-layer-scroll-blocked';
const BLOCKER_SCROLL_X_VAR = '--y-body-scroll-x';
const BLOCKER_SCROLL_Y_VAR = '--y-body-scroll-y';
const BLOCKER_SCROLL_OFFSET_VAR = '--y-scrollbar-offset';

function blockScrollStrategy(data: ScrollStrategyData, props: StrategyProps) {
  const offsetParent = data.root.value?.offsetParent;
  const scrollElements = [
    ...new Set([
      ...getScrollParents(
        data.baseEl.value,
        props.contained ? offsetParent : undefined,
      ),
      ...getScrollParents(
        data.contentEl.value,
        props.contained ? offsetParent : undefined,
      ),
    ]),
  ].filter((el) => !el.classList.contains(BLOCKER_CLASS));
  const scrollbarWidth =
    window.innerWidth - document.documentElement.offsetWidth;

  const scrollableParent = ((el) => hasScrollbar(el) && el)(
    offsetParent || document.documentElement,
  );
  if (scrollableParent) {
    data.root.value!.classList.add(BLOCKER_LAYER_CLASS);
  }

  scrollElements.forEach((el, i) => {
    el.style.setProperty(
      BLOCKER_SCROLL_X_VAR,
      toStyleSizeValue(-el.scrollLeft) ?? null,
    );
    el.style.setProperty(
      BLOCKER_SCROLL_Y_VAR,
      toStyleSizeValue(-el.scrollTop) ?? null,
    );
    el.style.setProperty(
      BLOCKER_SCROLL_OFFSET_VAR,
      toStyleSizeValue(scrollbarWidth) ?? null,
    );
    el.classList.add(BLOCKER_LAYER_CLASS);
  });

  onScopeDispose(() => {
    scrollElements.forEach((el, i) => {
      const x = parseFloat(el.style.getPropertyValue(BLOCKER_SCROLL_X_VAR));
      const y = parseFloat(el.style.getPropertyValue(BLOCKER_SCROLL_Y_VAR));

      el.style.removeProperty(BLOCKER_SCROLL_X_VAR);
      el.style.removeProperty(BLOCKER_SCROLL_Y_VAR);
      el.style.removeProperty(BLOCKER_SCROLL_OFFSET_VAR);
      el.classList.remove(BLOCKER_CLASS);

      el.scrollLeft = -x;
      el.scrollTop = -y;
    });
    if (scrollableParent) {
      data.root.value!.classList.remove(BLOCKER_LAYER_CLASS);
    }
  });
}

function repositionScrollStrategy(
  data: ScrollStrategyData,
  props: StrategyProps,
  scope: EffectScope,
) {
  let slow = false;
  let raf = -1;
  let ric = -1;

  function update(e: Event) {
    frameScheduler.requestNewFrame(() => {
      const start = performance.now();
      data.updateLevitation.value?.(e);
      const time = performance.now() - start;
      slow = time / (1000 / 60) > 2;
    });
  }

  ric = (
    typeof requestIdleCallback === 'undefined'
      ? (cb: Function) => cb()
      : requestIdleCallback
  )(() => {
    scope.run(() => {
      bindScroll(data.baseEl.value ?? data.contentEl.value, (e) => {
        if (slow) {
          // If the position calculation is slow,
          // defer updates until scrolling is finished.
          // Browsers usually fire one scroll event per frame so
          // we just wait until we've got two frames without an event
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => {
            raf = requestAnimationFrame(() => {
              update(e);
            });
          });
        } else {
          update(e);
        }
      });
    });
  });

  onScopeDispose(() => {
    typeof cancelIdleCallback !== 'undefined' && cancelIdleCallback(ric);
    cancelAnimationFrame(raf);
  });
}

/** @private */
function bindScroll(el: HTMLElement | undefined, onScroll: (e: Event) => void) {
  const scrollElements = [document, ...getScrollParents(el)];
  scrollElements.forEach((el) => {
    el.addEventListener('scroll', onScroll, { passive: true });
  });

  onScopeDispose(() => {
    scrollElements.forEach((el) => {
      el.removeEventListener('scroll', onScroll);
    });
  });
}
