import type { PropType, VNodeArrayChildren } from 'vue';
import { defineComponent, h, withDirectives } from 'vue';

import { PlateWave } from '../../directives/plate-wave';
import { isColorValue } from '../../util/color';
import { getSlot, propsFactory } from '../../util/vue-component';
import { YSpinnerRing } from '../loading/YSpinnerRing';

/**
 * Style
 */
import './YButton.scss';

const NAME = 'y-button';

export const pressYButtonProps = propsFactory(
  {
    loading: Boolean,
    disabled: {
      type: Boolean,
    },
    //
    variation: {
      type: String as PropType<string>,
    },
    small: Boolean,
    icon: Boolean,
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
    text: {
      type: Boolean,
    },
    //
    color: {
      type: String,
    },
    noWave: {
      type: Boolean,
      default: false,
    },
  },
  'YButton',
);

export const YButton = defineComponent({
  name: 'YButton',
  directives: {
    PlateWave,
  },
  props: {
    ...pressYButtonProps(),
  },
  computed: {
    variations(): any[] {
      const { variation } = this;
      if (variation) {
        return variation.split(',').map((value) => {
          return value.trim();
        });
      }
      return [];
    },
    //
    classes() {
      const { variations, outlined, rounded, filled, text, small, icon } = this;
      return {
        [`${NAME}--outlined`]: variations.includes('outlined') || outlined,
        [`${NAME}--rounded`]: variations.includes('rounded') || rounded,
        [`${NAME}--filled`]: variations.includes('filled') || filled,
        [`${NAME}--text`]: variations.includes('text') || text,
        [`${NAME}--small`]: variations.includes('small') || small,
        [`${NAME}--icon`]: variations.includes('icon') || icon,
        [`${NAME}--color`]: this.color,
        [`${NAME}--loading`]: this.loading,
        [`${NAME}--disabled`]: this.disabled,
      };
    },
    styles(): Record<string, any> {
      let { color } = this;
      let textColor: string | undefined;
      if (color && !isColorValue(color)) {
        color = `rgba(var(--y-theme-${color}), 1)`;
        textColor = `rgba(var(--y-theme-on-${this.color}), 1)`;
      }
      return {
        [`--y-button__color`]: color,
        [`--y-button__text-color`]: textColor,
      };
    },
  },
  methods: {
    createContent() {
      const defaultSlot = getSlot(this, 'default');
      const children: VNodeArrayChildren = [];
      if (this.loading) {
        children.push(h(YSpinnerRing, { width: '24', height: '24' }));
      }
      children.push(defaultSlot);
      return h('span', { class: 'y-button__content' }, children);
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
    const { onClick, styles, noWave, loading } = this;
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
      [[PlateWave, !noWave && !loading]],
    );
  },
});

export type YButton = InstanceType<typeof YButton>;
