import { defineComponent, h, type PropType, Transition } from 'vue';

import { animate } from '@/util/animation';

type VerticalSide = 'top' | 'bottom';
type HorizontalSide = 'left' | 'right';

function offsetTransform(el: Element, direction: 'v' | 'h', sign: 1 | -1) {
  const rect = el.getBoundingClientRect();
  const distance = direction === 'h' ? rect.width : rect.height;
  const value = distance * sign;
  return direction === 'h'
    ? `translateX(${value}px)`
    : `translateY(${value}px)`;
}

export function createSlideDirectionTransition(direction: 'v' | 'h') {
  const duration = 240;
  const easing = 'cubic-bezier(0.4, 0, 0.2, 1)';

  return defineComponent({
    name: `slide-${direction}-transition`,
    props: {
      // v: 'top' | 'bottom', h: 'left' | 'right'
      side: {
        type: String as PropType<VerticalSide | HorizontalSide>,
        required: true,
      },
      disabled: { type: Boolean as PropType<boolean>, default: false },
    },
    setup(props, { slots }) {
      function sign(): 1 | -1 {
        return props.side === 'top' || props.side === 'left' ? -1 : 1;
      }

      return () =>
        h(
          Transition,
          {
            css: false,
            onEnter(el: Element, done: () => void) {
              if (props.disabled) return done();
              const from = offsetTransform(el, direction, sign());
              animate(
                el,
                [
                  { transform: from, opacity: 0 },
                  { transform: 'translate(0, 0)', opacity: 1 },
                ],
                { duration, easing },
              ).finally(done);
            },
            onLeave(el: Element, done: () => void) {
              if (props.disabled) return done();
              const to = offsetTransform(el, direction, sign());
              animate(
                el,
                [
                  { transform: 'translate(0, 0)', opacity: 1 },
                  { transform: to, opacity: 0 },
                ],
                { duration, easing },
              ).finally(done);
            },
          },
          slots.default,
        );
    },
  });
}
