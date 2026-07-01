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
  },
  'YLayer.active-event',
);

export function useActiveEvent(
  props: any,
  {
    active,
    children,
    base,
    finish,
    baseSlotEl,
  }: {
    active: Ref<boolean>;
    children: Ref<HTMLElement[]>;
    base: Ref<any>;
    finish: Ref<boolean>;
    baseSlotEl: Ref<HTMLElement | null | undefined>;
  },
) {
  const vm = getCurrentInstance()!;
  const hovered = shallowRef(false);
  const focused = shallowRef(false);

  const { startOpenDelay, startCloseDelay } = useDelay(props, (to) => {
    if (
      !to &&
      props.openOnHover &&
      !hovered.value &&
      children.value.length === 0
    ) {
      active.value = false;
    } else if (to) {
      active.value = true;
    }
  });

  const isOpenFocus = computed(
    () => props.openOnFocus || (props.openOnFocus == null && props.openOnHover),
  );

  const isOpenClick = computed(
    () =>
      props.openOnClick ||
      (props.openOnClick == null && !props.openOnHover && !isOpenFocus.value),
  );

  const eventCatalog = {
    onMouseenter: (e: Event) => {
      hovered.value = true;
      startOpenDelay();
    },
    onMouseleave: (e: Event) => {
      hovered.value = false;
      startCloseDelay();
    },
    onClick: (e: Event) => {
      e.stopPropagation();
      const currentActive = active.value;
      if (props.disabled || (hovered.value && !finish.value)) {
        return;
      }
      active.value = !currentActive;
    },
    onFocus: (e: FocusEvent) => {
      startOpenDelay();
    },
    onBlur: (e: FocusEvent) => {
      startCloseDelay();
    },
  };

  const baseEvents = computed(() => {
    const events: Partial<BaseEvent> = {};

    if (isOpenClick.value) {
      events.onClick = eventCatalog.onClick;
    }
    if (isOpenFocus.value) {
      events.onFocus = eventCatalog.onFocus;
    }
    if (props.openOnHover) {
      events.onMouseenter = eventCatalog.onMouseenter;
      events.onMouseleave = eventCatalog.onMouseleave;
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

  return { hovered, focused, baseEvents };
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
    base,
    (neo, old) => {
      if (old && neo !== old) {
        unbindActiveEvent(old);
      }
      if (neo) {
        nextTick(() => bindActiveEvent(neo));
      }
    },
    { immediate: true },
  );

  onScopeDispose(() => {
    unbindActiveEvent();
  });

  function bindActiveEvent(el = base.value, _props = baseEvents.value) {
    if (!el) return;
    console.log(el);
    bindProps(el, _props);
  }

  function unbindActiveEvent(el = base.value, _props = baseEvents.value) {
    if (!el) return;
    unbindProps(el, _props);
  }
}
