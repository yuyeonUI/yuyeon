import { type PropType, computed } from 'vue';

import { useRender } from '@/composables/component';
import { useProgress } from '@/composables/progress';
import { clamp } from '@/util';
import { isColorValue } from '@/util/color';
import { defineComponent } from '@/util/component';
import { toStyleSizeValue } from '@/util/ui';

import './YProgressRing.scss';

export const YProgressRing = defineComponent({
  name: 'YProgressRing',
  props: {
    modelValue: {
      type: Number as PropType<number>,
    },
    rounded: {
      type: Boolean as PropType<boolean>,
    },
    size: {
      type: Number as PropType<number>,
      default: 32,
    },
    noRewindTransition: {
      type: Boolean as PropType<boolean>,
    },
    color: {
      type: String as PropType<string>,
      default: 'primary',
    },
    indeterminate: Boolean, // TODO: Like SpinnerRing
    reverse: Boolean,
    /**
     * Percent value 0~100
     */
    width: {
      type: Number,
      default: 20,
    },
  },
  setup(props, { slots }) {
    const circumference = 2 * Math.PI * 24;

    const { numValue, delta } = useProgress(props);

    const leadColor = computed(() => {
      let color = props.color ?? '';
      if (!isColorValue(color)) {
        color = `var(--y-theme-${color})`;
      }
      return color;
    });

    const holePath = computed(() => {
      const widthPercent = clamp(props.width, 1, 100);
      if (widthPercent === 100) {
        return '';
      }
      const boxSize = 48;
      const precision = 64;
      const radius = ((100 - widthPercent) / 100) * (boxSize / 2);
      const vertices = [...Array(precision)].map((_, i) => {
        const a = (-i / (precision - 1)) * Math.PI * 2;
        const x = Math.cos(a) * radius + boxSize / 2;
        const y = Math.sin(a) * radius + boxSize / 2;
        return `${x}px ${y}px`;
      });
      return `polygon(100% 50%, 100% 100%, 0 100%, 0 0, 100% 0, 100% 50%, ${vertices.join(',')})`;
    });

    const dashOffset = computed(() => {
      return circumference - (circumference * numValue.value) / 100;
    });

    const classes = computed(() => {
      let noTransition = false;
      if (props.noRewindTransition && delta.value < 0) {
        noTransition = true;
      }

      return {
        'y-progress--no-trans': noTransition,
        'y-progress--indeterminate': props.indeterminate,
        'y-progress-ring--hole': !!holePath.value,
      };
    });

    useRender(() => (
      <div
        class={{ 'y-progress y-progress-ring': true, ...classes.value }}
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={numValue.value}
        style={{
          '--y-progress-ring__size': toStyleSizeValue(props.size),
          '--y-progress-ring__color': leadColor.value,
          '--y-progress-ring__value': numValue.value,
          '--y-progress-ring__hole-path': holePath.value,
        }}
      >
        <svg
          class="y-progress-ring__tube"
          width="48"
          height="48"
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle class="y-progress-ring__track" cx="24" cy="24" r="24" />
          <circle
            class="y-progress-ring__lead"
            cx="24"
            cy="24"
            r="12"
            stroke-width="24"
            stroke-dasharray={circumference / 2}
            stroke-dashoffset={dashOffset.value / 2}
          />
        </svg>
      </div>
    ));

    return {
      numValue,
      delta,
    };
  },
});

export type YProgressRing = InstanceType<typeof YProgressRing>;
