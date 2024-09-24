import { computed } from 'vue';

import { useRender } from '@/composables';
import { isColorValue, rgbFromHex } from '@/util/color';
import { defineComponent, hasEventProp, propsFactory } from '@/util/component';

import './YChip.scss';

export const pressYChipPropsOptions = propsFactory(
  {
    color: String,
    background: String,
    backgroundOpacity: {
      type: Number,
      default: 0.14,
    },
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

    const styles = computed(() => {
      let { color, background } = props;
      if (!background) background = color;

      if (color && !isColorValue(color)) {
        color = `var(--y-theme-${color})`;
      }

      if (background) {
        if (isColorValue(background)) {
          background = colorRgb(background);
        } else if (!background.startsWith('var(')) {
          background = `var(--y-theme-${background}-rgb)`;
        }
      }

      return {
        color,
        background: `rgba(${background}, ${props.backgroundOpacity})`,
      };
    });

    function colorRgb(color: string): string {
      if (color?.startsWith('#')) {
        return rgbFromHex(color)?.join(',') || '';
      }
      const RGBA_REGEX = /rgb(a?)\((?<v>.*)\)/;
      if (RGBA_REGEX.test(color)) {
        const value = RGBA_REGEX.exec(color)?.[2] || '';
        if (value) {
          const valueArray = value.trim().split(',');
          valueArray.splice(3, 1);
          return valueArray.join(',');
        }
      }
      return '';
    }

    useRender(() => (
      <span
        class={[
          'y-chip',
          {
            'y-chip--small': props.small,
            'y-chip--clickable': clickable.value,
          },
        ]}
        style={styles.value}
      >
        <span class="y-chip__content">{slots.default?.()}</span>
      </span>
    ));

    return {};
  },
});

export type YChip = InstanceType<typeof YChip>;
