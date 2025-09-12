import {
  MaybeRef,
  PropType,
  computed,
  defineComponent,
  h,
  ref,
  unref,
} from 'vue';

import { useRender } from '@/composables/component';
import { getHtmlElement } from '@/util/index';

type Coord = { x: number; y: number };

export const YDraggable = defineComponent({
  name: 'YDraggable',
  props: {
    as: [Object, String] as PropType<object | string>,
    handle: [Object, String] as PropType<MaybeRef<HTMLElement | string>>,
    disabled: Boolean,
    capture: Boolean,
    exact: Boolean,
    container: [Object, String] as PropType<
      MaybeRef<HTMLElement | SVGElement | null> | string
    >,
    onDragStart: Function as PropType<
      (pos: Coord, e: PointerEvent) => boolean | undefined
    >,
  },
  emits: ['start'],
  setup(props, { slots, emit }) {
    const targetRef = ref();
    const dragging = ref(false);
    const originPosition = ref();
    const position = ref();

    const targetEl = computed(() => {
      return getHtmlElement(targetRef.value);
    });

    const handleEl = computed(() => {
      let el = targetEl.value;
      if (typeof props.handle === 'string') {
        const hEl = targetEl.value?.querySelector(props.handle);
        if (hEl?.nodeType === 1) el = hEl;
      }
      return el;
    });

    const containerEl = computed(() => {
      const container = unref(props.container);
      if (typeof container === 'string') {
        return document.querySelector(container);
      } else if (container) {
        return getHtmlElement(container);
      }
      return undefined;
    });

    const slotProps = computed(() => {
      return {
        handle: handleEl.value,
      };
    });

    const start = (e: PointerEvent) => {
      console.log('start', e);
      if (props.disabled) return;
      if (props.exact && e.target !== targetEl.value) return;

      const container = containerEl.value;
      const containerRect = container?.getBoundingClientRect?.();
      const targetRect = targetEl.value?.getBoundingClientRect();
      const pos = {
        x:
          e.clientX -
          (container
            ? targetRect.left - containerRect!.left + container.scrollLeft
            : targetRect.left),
        y:
          e.clientY -
          (container
            ? targetRect.top - containerRect!.top + container.scrollTop
            : targetRect.top),
      };
      if (props.onDragStart?.(pos, e) === false) return;
      originPosition.value = pos;
    };

    const move = (e: PointerEvent) => {
      console.log('move', e);
    };

    const end = (e: PointerEvent) => {
      console.log('end', e);
    };

    useRender(() => {
      if (slots.default) {
        return h(
          props.as || 'div',
          { ref: targetRef },
          slots.default(slotProps.value),
        );
      }
      return h('div');
    });

    if (window) {
      const config = { capture: props.capture ?? true };
      // useEventListener(handleEl, 'pointerdown', start, config);
      // useEventListener(window, 'pointermove', move, config);
      // useEventListener(window, 'pointerup', end, config);
    }

    return {
      targetEl,
      handleEl,
      dragging,
      position,
    };
  },
});

export type YDraggable = InstanceType<typeof YDraggable>;
