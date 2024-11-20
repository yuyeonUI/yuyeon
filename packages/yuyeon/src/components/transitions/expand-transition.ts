import {
  type PropType,
  type Ref,
  Transition,
  defineComponent,
  h,
  ref,
} from 'vue';

import { kebabToCamel } from '@/util/string';

type HTMLParentElement = (Node & ParentNode & HTMLElement) | null;
interface HTMLExpandElement extends HTMLElement {
  _parent?: HTMLParentElement;
  _originStyle?: {
    transition: string;
    overflow: string;
    height?: string | null;
    width?: string | null;
    flex: string;
  };
}

export function createExpandTransition(isHorizon = false) {
  const direction = isHorizon ? 'h' : 'v';
  const name = `expand-${direction}-transition`;
  const sizeProperty = isHorizon ? 'width' : 'height';
  const offsetProperty = kebabToCamel(`offset-${sizeProperty}`) as
    | 'offsetWidth'
    | 'offsetHeight';

  function getExpandTransitionHooks(
    cache: Ref<number | undefined>,
    relay: boolean,
  ): Record<string, any> {
    function resetStyle(el: HTMLExpandElement) {
      if (el._originStyle) {
        el.style.overflow = el._originStyle.overflow;
        el.style.flex = el._originStyle.flex;
        const size = el._originStyle[sizeProperty];
        if (size != null) {
          el.style[sizeProperty] = size;
        }
      }
      delete el._originStyle;
    }

    function cacheSize(el: HTMLExpandElement) {
      if (relay && el) {
        const rect = el.getBoundingClientRect();
        cache.value = rect?.[sizeProperty];
      }
    }

    return {
      onBeforeEnter(el: HTMLExpandElement) {
        el._parent = el.parentNode as HTMLParentElement;
        el._originStyle = {
          transition: el.style.transition,
          overflow: el.style.overflow,
          [sizeProperty]: el.style[sizeProperty],
          flex: el.style.flex,
        };
      },
      onEnter(el: HTMLExpandElement) {
        const originStyle = el._originStyle;
        el.style.setProperty('transition', 'none', 'important');
        el.style.overflow = 'hidden';
        el.style.flex = '0 0 auto';
        const offsetSize = `${el[offsetProperty]}px`;
        if (relay && cache.value != null) {
          el.style[sizeProperty] = `${cache.value}px`;
        } else {
          el.style[sizeProperty] = '0';
        }
        el.getBoundingClientRect();
        el.style.transition = originStyle?.transition ?? '';

        requestAnimationFrame(() => {
          el.style[sizeProperty] = offsetSize;
        });
      },
      onAfterEnter(el: HTMLExpandElement) {
        resetStyle(el);
      },
      onEnterCancelled(el: HTMLExpandElement) {
        resetStyle(el);
      },
      onLeave(el: HTMLExpandElement) {
        cacheSize(el);
        if (relay) {
          return;
        }
        el._originStyle = {
          transition: '',
          overflow: el.style.overflow,
          flex: el.style.flex,
          [sizeProperty]: el.style[sizeProperty],
        };
        el.style.overflow = 'hidden';
        el.style.flex = '0 0 auto';
        el.style[sizeProperty] = `${el[offsetProperty]}px`;
        el.getBoundingClientRect();
        requestAnimationFrame(() => {
          el.style[sizeProperty] = '0';
        });
      },
      onAfterLeave(el: HTMLExpandElement) {
        resetStyle(el);
      },
      onLeaveCancelled(el: HTMLExpandElement) {
        resetStyle(el);
      },
    };
  }

  return defineComponent({
    name,
    props: {
      disabled: {
        type: Boolean as PropType<boolean>,
        default: false,
      },
      relay: Boolean,
    },
    setup(props, { slots }) {
      const cacheValue = ref<number | undefined>();
      return () =>
        h(
          Transition,
          {
            name: props.disabled ? '' : name,
            css: !props.disabled,
            ...(props.disabled
              ? {}
              : getExpandTransitionHooks(cacheValue, props.relay)),
          },
          slots.default,
        );
    },
  });
}
