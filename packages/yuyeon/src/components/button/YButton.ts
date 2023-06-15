import type { ExtractPropTypes, PropType, VNodeArrayChildren } from 'vue';
import { defineComponent, h, withDirectives } from 'vue';

import { PlateWave } from '../../directives/plate-wave';
import { isColorValue } from '../../util/ui';
import { getSlot } from '../../util/vue-component';
import { YSpinnerRing } from '../loading/YSpinnerRing';

/**
 * Style
 */
import './YButton.scss';

const NAME = 'y-button';

export const buttonProps = {
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
  noWave: {
    type: Boolean,
    default: false,
  },
  variation: {
    type: String as PropType<string>,
  },
} as const;

export type Props = ExtractPropTypes<typeof buttonProps>;

export const YButton = defineComponent({
  name: 'YButton',
  directives: {
    PlateWave,
  },
  props: {
    ...buttonProps,
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
    small(): boolean {
      return this.variations.includes('small');
    },
    icon(): boolean {
      return this.variations.includes('icon');
    },
    //
    classes() {
      return {
        [`${NAME}--outlined`]: this.outlined,
        [`${NAME}--loading`]: this.loading,
        [`${NAME}--rounded`]: this.rounded,
        [`${NAME}--filled`]: this.filled,
        [`${NAME}--disabled`]: this.disabled,
        [`${NAME}--text`]: this.text,
        [`${NAME}--small`]: this.small,
        [`${NAME}--icon`]: this.icon,
        [`${NAME}--color`]: this.color,
      };
    },
    styles(): Record<string, any> {
      let { color } = this;
      if (color && !isColorValue(color)) {
        color = `rgba(var(--y-theme--${color}), 1)`;
      }
      return {
        [`--y-button__color`]: color,
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
