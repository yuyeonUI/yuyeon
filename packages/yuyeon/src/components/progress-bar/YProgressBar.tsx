import { PropType, StyleValue, defineComponent } from 'vue';

import { useProgress } from '../../composables/progress';
import './YProgressBar.scss';
import { isColorValue } from "../../util/color";

export const YProgressBar = defineComponent({
  name: 'YProgressBar',
  props: {
    value: {
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
  setup(props) {
    const { numValue } = useProgress(props);

    return {
      numValue,
    };
  },
  data() {
    return {
      delta: 0,
    };
  },
  computed: {
    classes(): Record<string, boolean> {
      let noTransition = false;
      if (this.noRewindTransition && this.delta < 0) {
        noTransition = true;
      }
      return {
        'y-progress--no-trans': noTransition,
        'y-progress--outlined': !!this.outlined,
        'y-progress--indeterminate': !!this.indeterminate,
        'y-progress-bar--rounded': !!this.rounded,
        'y-progress-bar--reverse': !!this.reverse,
      };
    },
    leadColor(): string {
      let color = this.color ?? '';
      if (!isColorValue(color)) {
        color = `rgba(var(--y-theme--${color}), 1)`;
      }
      return color;
    },
    styles(): StyleValue {
      let minWidth;
      if (this.innerText && this.numValue < 5 && this.numValue > 0) {
        minWidth = '2rem';
      }
      return {
        transform: `scaleX(${this.numValue / 100})`,
        minWidth,
      };
    },
  },
  render() {
    const {
      classes,
      numValue,
      height,
      outlineColor,
      textColor,
      styles,
      innerText,
    } = this;
    const slots = this.$slots;
    return (
      <div
        class={{ 'y-progress y-progress-bar': true, ...classes }}
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={numValue}
        style={{
          '--y-progress-bar__height':
            height !== undefined ? `${height}px` : undefined,
          '--y-progress-bar__outline-color':
            outlineColor !== undefined ? outlineColor : undefined,
          '--y-progress-bar__color': this.leadColor,
        }}
      >
        <div class="y-progress__track"></div>
        <div class="y-progress__tube">
          <div class="y-progress__lead" style={styles}>
            {slots['lead-inner']
              ? slots['lead-inner']()
              : innerText && (
                  <div
                    class={{
                      'y-progress__lead-inner': true,
                      'y-progress__lead-inner--fixed': numValue < 3,
                    }}
                    style={{ color: textColor }}
                  >
                    <span>{numValue} %</span>
                  </div>
                )}
          </div>
        </div>
      </div>
    );
  },
});
