import { defineComponent, h, VNodeArrayChildren, withDirectives } from 'vue';
import { getSlot } from "../../util/vue-component";
import { PlateWave } from "../../directives/plate-wave";

/**
 * Style
 */
import './y-btn.scss';
import YRingSpinner from '../ring-spinner/y-ring-spinner.vue';
import { isColorValue } from '../../util/ui';

const NAME = 'y-btn';

export default defineComponent({
  name: NAME,
  directives: {
    PlateWave,
  },
  props: {
    loading: Boolean,
    outlined: {
      type: Boolean,
      default: false,
    },
    rounded: {
      type: Boolean,
      default: false,
    },
    filled: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
    },
    text: {
      type: Boolean,
    },
    color: {
      type: String,
    },
  },
  computed: {
    classes() {
      return {
        [`${NAME}--outlined`]: this.outlined,
        [`${NAME}--loading`]: this.loading,
        [`${NAME}--rounded`]: this.rounded,
        [`${NAME}--filled`]: this.filled,
        [`${NAME}--disabled`]: this.disabled,
        [`${NAME}--text`]: this.text,
      };
    },
    styles(): Record<string, any> {
      let { color } = this;
      if (color && !isColorValue(color)) {
        color = `var(--y-palette--${color})`;
      }
      return {
        [`--y-btn__color`]: color,
      };
    },
  },
  methods: {
    createContent() {
      const defaultSlot = getSlot(this, 'default');
      const children: VNodeArrayChildren = [];
      if (this.loading) {
        children.push(h(YRingSpinner));
      }
      children.push(defaultSlot);
      return h('span', { class: 'y-btn__content' }, children);
    },
    getClasses() {
      return this.classes;
    },
    /// Events
    onClick(e: MouseEvent) {
      e.preventDefault();
      if (this.loading) {
        return;
      }
    },
  },
  render() {
    const { onClick, styles } = this;
    return withDirectives(
      h(
        'button',
        {
          class: {
            ...this.getClasses(),
            [`${NAME}`]: true,
          },
          style: styles,
          onClick,
          '^disabled': this.disabled ? true : undefined,
        },
        this.createContent(),
      ),
      [[PlateWave, true]],
    );
  },
});
