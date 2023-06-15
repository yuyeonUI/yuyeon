import { PropType, Transition, defineComponent, h } from 'vue';

import { kebabToCamel } from '../../util/string';

type HTMLParentElement = (Node & ParentNode & HTMLElement) | null;
interface HTMLExpandElement extends HTMLElement {
  _parent?: HTMLParentElement;
  _originStyle?: {
    transition: string;
    overflow: string;
    height?: string | null;
    width?: string | null;
  };
}

export function createExpandTransition(isHorizon = false) {
  const direction = isHorizon ? 'h' : 'v';
  const name = `expand-${direction}-transition`;
  const sizeProperty = isHorizon ? 'width' : 'height';
  const offsetProperty = kebabToCamel(`offset-${sizeProperty}`) as
    | 'offsetWidth'
    | 'offsetHeight';

  function getExpandTransitionHooks(): Record<string, any> {
    function resetStyle(el: HTMLExpandElement) {
      if (el._originStyle) {
        el.style.overflow = el._originStyle.overflow;
        const size = el._originStyle[sizeProperty];
        if (size != null) {
          el.style[sizeProperty] = size;
        }
      }
      delete el._originStyle;
    }

    return {
      onBeforeEnter(el: HTMLExpandElement) {
        el._parent = el.parentNode as HTMLParentElement;
        el._originStyle = {
          transition: el.style.transition,
          overflow: el.style.overflow,
          [sizeProperty]: el.style[sizeProperty],
        };
      },
      onEnter(el: HTMLExpandElement) {
        const originStyle = el._originStyle;
        el.style.setProperty('transition', 'none', 'important');
        el.style.overflow = 'hidden';
        const offsetSize = `${el[offsetProperty]}px`;
        el.style[sizeProperty] = '0';
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
        el._originStyle = {
          transition: '',
          overflow: el.style.overflow,
          [sizeProperty]: el.style[sizeProperty],
        };
        el.style.overflow = 'hidden';
        el.style[sizeProperty] = `${el[offsetProperty]}px`;
        el.getBoundingClientRect();

        requestAnimationFrame(() => {
          el.style[sizeProperty] = '0';
        })
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
    },
    setup(props, { slots }) {
      return () =>
        h(
          Transition,
          { name: props.disabled ? '' : name, css: !props.disabled, ...(props.disabled ? {} : getExpandTransitionHooks()) },
          slots.default,
        );
    },
  });
}
