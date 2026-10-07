import {
  type ComponentInternalInstance,
  computed,
  type EffectScope,
  effectScope,
  getCurrentInstance,
  nextTick,
  onScopeDispose,
  type PropType,
  type Ref,
  shallowRef,
  watch,
} from 'vue';

import { propsFactory } from '@/util';
import { bindProps, unbindProps } from '@/util/component/bind-props';

import { useDelay } from './active-delay';

interface ActiveEventProps {
  openOnHover: boolean;
  openOnFocus: boolean;
  openOnClick: boolean;
  openOnClickBase: boolean;
}

type BaseEvent = {
  onClick: (e: Event) => void;
  onFocus: (e: FocusEvent) => void;
  onBlur: (e: FocusEvent) => void;
  onPointerdown: (e: PointerEvent) => void;
  onPointerup: (e: PointerEvent) => void;
  onPointercancel: (e: PointerEvent) => void;
  onMouseenter: (e: Event) => void;
  onMouseleave: (e: Event) => void;
};

export const pressActiveEventProps = propsFactory(
  {
    openOnHover: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    openOnFocus: {
      type: Boolean as PropType<boolean>,
      default: undefined,
    },
    openOnClick: {
      type: Boolean as PropType<boolean>,
      default: undefined,
    },
    openOnClickBase: {
      type: Boolean as PropType<boolean>,
      default: undefined,
    },
    closeOnEscape: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
  },
  'YLayer.active-event',
);

export const pressContentPropsOptions = propsFactory(
  {
    closeClickContent: {
      type: Boolean as PropType<boolean>,
    },
    contentProps: {
      type: Object as PropType<Record<string, any>>,
    },
  },
  'YLayer.content',
);

export interface ContentProps {
  closeClickContent: boolean | undefined;
}

export function useActiveEvent(
  props: any,
  {
    active,
    pinned,
    children,
    base,
    finish,
    baseSlotEl,
    content,
  }: {
    active: Ref<boolean>;
    pinned: Ref<boolean>;
    children: Ref<ComponentInternalInstance[]>;
    base: Ref<any>;
    finish: Ref<boolean>;
    baseSlotEl: Ref<HTMLElement | null | undefined>;
    content: Ref<HTMLElement | undefined>;
  },
) {
  const vm = getCurrentInstance()!;
  const hovered = shallowRef(false);
  const focused = shallowRef(false);
  let focusCheckId = 0;
  let pointerDown = false;
  let suppressFocusOpen = false;

  function isFocusWithin(target: EventTarget | null | undefined) {
    if (!(target instanceof Node)) return false;

    return [base.value, baseSlotEl.value, content.value].some((el) => {
      return el instanceof Node && el.contains(target);
    });
  }

  function updateFocusState(e: FocusEvent) {
    if (isFocusWithin(e.relatedTarget)) {
      focusCheckId++;
      focused.value = true;
      return;
    }

    const checkId = ++focusCheckId;
    nextTick(() => {
      if (checkId !== focusCheckId) return;

      if (isFocusWithin(document.activeElement)) {
        focused.value = true;
        return;
      }

      focused.value = false;
      startCloseDelay();
    });
  }

  const { startOpenDelay, startCloseDelay, cancelOpenDelay } = useDelay(
    props,
    (to) => {
      if (to) {
        active.value = true;
      } else if (
        !hovered.value &&
        !focused.value &&
        children.value.length === 0
      ) {
        active.value = false;
      }
    },
  );

  watch(active, (to) => {
    if (!to) cancelOpenDelay();
  });

  function suppressNextFocusOpen() {
    suppressFocusOpen = true;
    nextTick(() => {
      suppressFocusOpen = false;
    });
  }

  const isOpenFocus = computed(
    () => props.openOnFocus || (props.openOnFocus == null && props.openOnHover),
  );

  const isOpenClick = computed(
    () =>
      props.openOnClickBase !== false &&
      (props.openOnClick ||
        (props.openOnClick == null &&
          !props.openOnHover &&
          !isOpenFocus.value)),
  );

  const eventCatalog = {
    onMouseenter: (e: Event) => {
      hovered.value = true;
      startOpenDelay();
    },
    onMouseleave: (e: Event) => {
      hovered.value = false;
      if (pinned.value) return;
      startCloseDelay();
    },
    onClick: (e: Event) => {
      if (!isOpenClick.value || props.disabled) return;

      e.stopPropagation();
      if (isOpenClick.value && props.openOnHover) {
        pinned.value = !pinned.value;
        if (!active.value) active.value = true;
        return;
      }
      if (hovered.value && !finish.value) return;

      active.value = !active.value;
    },
    onFocus: (e: FocusEvent) => {
      if (suppressFocusOpen) {
        suppressFocusOpen = false;
        return;
      }

      focusCheckId++;
      focused.value = true;
      startOpenDelay();
    },
    onBlur: (e: FocusEvent) => {
      updateFocusState(e);
    },
    onPointerdown: (e: PointerEvent) => {
      pointerDown = true;
    },
    onPointerup: (e: PointerEvent) => {
      pointerDown = false;
    },
    onPointercancel: (e: PointerEvent) => {
      pointerDown = false;
    },
  };

  const baseEvents = computed(() => {
    const events: Partial<BaseEvent> = {};

    if (isOpenClick.value) {
      events.onClick = eventCatalog.onClick;
    }
    if (isOpenFocus.value) {
      events.onFocus = (e: FocusEvent) => {
        if (pointerDown) {
          pointerDown = false;
          return;
        }

        eventCatalog.onFocus(e);
      };
      events.onBlur = eventCatalog.onBlur;
      events.onPointerdown = eventCatalog.onPointerdown;
      events.onPointerup = eventCatalog.onPointerup;
      events.onPointercancel = eventCatalog.onPointercancel;
    }
    if (props.openOnHover) {
      events.onMouseenter = eventCatalog.onMouseenter;
      events.onMouseleave = eventCatalog.onMouseleave;
    }

    return events;
  });

  const contentEvents = computed(() => {
    const events: Record<string, EventListener> = {};

    if (props.openOnHover) {
      events.onMouseenter = (e: Event) => {
        hovered.value = true;
        startOpenDelay();
      };
      events.onMouseleave = (e: Event) => {
        hovered.value = false;
        if (pinned.value) return;
        startCloseDelay();
      };
    }

    if (isOpenFocus.value) {
      events.onFocusin = (e: Event) => {
        focusCheckId++;
        focused.value = true;
      };
      events.onFocusout = (e: Event) => {
        updateFocusState(e as FocusEvent);
      };
    }

    if (props.closeClickContent) {
      events.onClick = (e: Event) => {
        active.value = false;
      };
    }

    return events;
  });

  let scope: EffectScope | undefined;

  watch(
    () => !!props.base,
    (to) => {
      if (to && typeof window !== 'undefined') {
        scope = effectScope();
        scope.run(() => {
          _useActiveEventBinder(props, vm, {
            base,
            baseEvents: baseEvents,
          });
        });
      }
    },
    { immediate: true, flush: 'post' },
  );

  return {
    hovered,
    focused,
    baseEvents,
    contentEvents,
    cancelOpenDelay,
    suppressNextFocusOpen,
  };
}

function _useActiveEventBinder(
  props: ActiveEventProps,
  vm: ComponentInternalInstance,
  {
    base,
    baseEvents,
  }: {
    base: Ref<HTMLElement | undefined>;
    baseEvents: Ref<Partial<BaseEvent>>;
  },
) {
  watch(
    [base, baseEvents],
    ([neo, neoProps], oldValue) => {
      const [old, oldProps] = oldValue ?? [];

      if (old) {
        unbindActiveEvent(old, oldProps);
      }
      if (neo) {
        nextTick(() => {
          if (neo !== base.value || neoProps !== baseEvents.value) return;
          bindActiveEvent(neo, neoProps);
        });
      }
    },
    { immediate: true },
  );

  onScopeDispose(() => {
    unbindActiveEvent();
  });

  function bindActiveEvent(el = base.value, _props = baseEvents.value) {
    if (!el) return;
    if (Array.isArray(el)) return;
    bindProps(el, _props);
  }

  function unbindActiveEvent(el = base.value, _props = baseEvents.value) {
    if (!el) return;
    if (Array.isArray(el)) return;
    unbindProps(el, _props);
  }
}
