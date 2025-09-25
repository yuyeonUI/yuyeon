import { computed } from 'vue';

import { useRender } from '@/composables';
import {
  styleColorPropsOptions,
  useStyleColor,
} from '@/composables/style-color';
import { defineComponent, hasEventProp, propsFactory } from '@/util/component';

import './YChip.scss';

export const pressYChipPropsOptions = propsFactory(
  {
    ...styleColorPropsOptions,
    small: Boolean,
  },
  'YChip',
);

export const YChip = defineComponent({
  name: 'YChip',
  props: {
    ...pressYChipPropsOptions(),
  },
  setup(props, { slots, emit }) {
    const clickable = computed(() => {
      return hasEventProp(props, 'click');
    });
    const { colorVars } = useStyleColor(props, 'chip');

    useRender(() => (
      <span
        class={[
          'y-chip',
          {
            'y-chip--small': props.small,
            'y-chip--clickable': clickable.value,
          },
        ]}
        style={colorVars.value}
      >
        <span class="y-chip__content">{slots.default?.()}</span>
      </span>
    ));

    return {};
  },
});

export type YChip = InstanceType<typeof YChip>;
