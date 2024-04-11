import { defineComponent } from 'vue';
import { useModelDuplex } from 'yuyeon/composables';

import { useRender } from '../../composables/component';
import { useDelay } from '../../composables/timing';
import { propsFactory } from '../../util';

export const pressYHoverPropsOptions = propsFactory(
  {
    disabled: Boolean,
    modelValue: {
      type: Boolean,
      default: undefined,
    },
    openDelay: {
      type: Number,
      default: 100,
    },
    closeDelay: {
      type: Number,
      default: 100,
    },
  },
  'YHover',
);

export const YHover = defineComponent({
  name: 'YHover',
  props: pressYHoverPropsOptions(),
  setup(props, { slots }) {
    const isHovering = useModelDuplex(props, 'modelValue');
    const { startOpenDelay, startCloseDelay } = useDelay(
      props,
      (value: any) => {
        !props.disabled && (isHovering.value = value);
      },
    );

    useRender(() => {
      return (
        <>
          {slots.default?.({
            isHovering: isHovering.value,
            props: {
              onMouseenter: () => startOpenDelay(),
              onMouseleave: () => startCloseDelay(),
            },
          })}
        </>
      );
    });
  },
});
