import { type PropType, computed, shallowRef } from 'vue';

import { useRender } from '@/composables';
import { useProgress } from '@/composables/progress';
import { isColorValue } from '@/util/color';
import { defineComponent } from '@/util/component';

import './YProgressBar.scss';

export const YProgressBar = defineComponent({
  name: 'YProgressBar',
  props: {
    modelValue: {
      type: Number as PropType<number>,
    },
    rounded: {
      type: Boolean as PropType<boolean>,
    },
    height: {
      type: Number as PropType<number>,
    },
    noRewindTransition: {
      type: Boolean as PropType<boolean>,
    },
    outlined: {
      type: Boolean as PropType<boolean>,
    },
    innerText: {
      type: Boolean as PropType<boolean>,
    },
    color: {
      type: String as PropType<string>,
      default: 'primary',
    },
    textColor: {
      type: String as PropType<string>,
    },
    outlineColor: {
      type: String as PropType<string>,
    },
    indeterminate: Boolean,
    reverse: Boolean,
  },
  setup(props, { slots }) {
    const { numValue, delta } = useProgress(props);

    const classes = computed(() => {
      let noTransition = false;
      if (props.noRewindTransition && delta.value < 0) {
        noTransition = true;
      }

      return {
        'y-progress--no-trans': noTransition,
        'y-progress--outlined': props.outlined,
        'y-progress--indeterminate': props.indeterminate,
        'y-progress-bar--rounded': props.rounded,
        'y-progress-bar--reverse': props.reverse,
      };
    });

    const leadColor = computed(() => {
      let color = props.color ?? '';
      if (!isColorValue(color)) {
        color = `var(--y-theme-${color})`;
      }
      return color;
    });

    const styles = computed(() => {
      let minWidth;
      if (props.innerText && numValue.value < 5 && numValue.value > 0) {
        minWidth = '2rem';
      }
      return {
        width: `${numValue.value}%`,
        minWidth,
      };
    });

    useRender(() => (
      <div
        class={{ 'y-progress y-progress-bar': true, ...classes.value }}
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={numValue.value}
        style={{
          '--y-progress-bar__height':
            props.height !== undefined ? `${props.height}px` : undefined,
          '--y-progress-bar__outline-color':
            props.outlineColor !== undefined ? props.outlineColor : undefined,
          '--y-progress-bar__color': leadColor.value,
          '--y-progress-bar__value': numValue.value,
        }}
      >
        <div class="y-progress__track"></div>
        <div class="y-progress__tube">
          <div class="y-progress__lead" style={styles.value}>
            {slots['lead-inner']
              ? slots['lead-inner']()
              : props.innerText && (
                  <div
                    class={{
                      'y-progress__lead-inner': true,
                      'y-progress__lead-inner--fixed': numValue.value < 3,
                    }}
                    style={{ color: props.textColor }}
                  >
                    <span>{numValue} %</span>
                  </div>
                )}
          </div>
        </div>
      </div>
    ));

    return {
      numValue,
      delta,
    };
  },
});

export type YProgressBar = InstanceType<typeof YProgressBar>;
