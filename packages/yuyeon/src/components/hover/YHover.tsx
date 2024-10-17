import { ref, watch } from 'vue';
import { useModelDuplex } from 'yuyeon/composables';

import { useRender } from '@/composables/component';
import { useDelay } from '@/composables/timing';
import { defineComponent, propsFactory } from '@/util/component';

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
  emits: ['update:modelValue', 'hover'],
  setup(props, { slots, emit }) {
    const isHovering = useModelDuplex(props, 'modelValue');
    const { startOpenDelay, startCloseDelay } = useDelay(
      props,
      (value: any) => {
        !props.disabled && (isHovering.value = value);
      },
    );

    const defaultSlot = ref<any>();

    watch(isHovering, (neo) => {
      emit('hover', neo, defaultSlot);
    });

    useRender(() => {
      defaultSlot.value = slots.default?.({
        isHovering: isHovering.value,
        props: {
          onMouseenter: () => startOpenDelay(),
          onMouseleave: () => startCloseDelay(),
        },
      });
      return <>{defaultSlot.value}</>;
    });
  },
});

export type YHover = InstanceType<typeof YHover>;
