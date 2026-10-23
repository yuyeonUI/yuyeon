import type { PropType, SlotsType } from 'vue';
import { computed, mergeProps } from 'vue';

import {
  pressChoiceItemPropsOptions,
  useChoiceItem,
} from '@/composables/choice';
import { useChoiceByLink } from '@/composables/choice-link';
import { useRender } from '@/composables/component';
import { pressVueRouterPropsOptions, useLink } from '@/composables/vue-router';
import { PlateWave } from '@/directives/plate-wave';
import { isColorValue } from '@/util/color';
import { defineComponent, propsFactory } from '@/util/component';

import { YSpinnerRing } from '../loading/YSpinnerRing';
import { Y_TOGGLE_BUTTON_KEY } from '../toggle-button';

/**
 * Style
 */
import './YButton.scss';

const NAME = 'y-button';

export const pressYButtonProps = propsFactory(
  {
    loading: Boolean,
    active: { type: Boolean, default: undefined },
    injectSymbol: { type: null, default: Y_TOGGLE_BUTTON_KEY },
    //
    variant: {
      type: String as PropType<string>,
    },
    /** @deprecated Use `variant` instead. */
    variation: {
      type: String as PropType<string>,
    },
    tabindex: {
      type: [Number, String] as PropType<number | string>,
    },
    small: Boolean,
    icon: Boolean,
    size: [String, Number],
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
    //
    color: {
      type: String,
    },
    noWave: {
      type: Boolean,
      default: false,
    },
    ...pressVueRouterPropsOptions(),
    ...pressChoiceItemPropsOptions(),
  },
  'YButton',
);

export const YButton = defineComponent({
  name: 'YButton',
  directives: {
    PlateWave,
  },
  props: pressYButtonProps(),
  slots: Object as SlotsType<{
    default: any;
    loading: any;
    append: any;
  }>,
  emits: {
    click: (event: MouseEvent) => true,
    'choice:selected': (choice: { value: boolean }) => true,
  },
  setup(props, { attrs, slots, emit }) {
    const choice = useChoiceItem(props, props.injectSymbol, false);
    const link = useLink(props, attrs);
    useChoiceByLink(link, choice?.select);

    const isActive = computed(() => {
      if (props.active !== undefined) {
        return props.active;
      }
      if (link.isLink.value) {
        return link.isActive?.value;
      }
      return choice?.isSelected.value;
    });

    const variants = computed(() => {
      const variant = props.variant ?? props.variation;
      if (typeof variant === 'string') {
        return variant.split(',').map((value) => {
          return value.trim();
        });
      }
      return [];
    });

    const classes = computed(() => {
      const { outlined, rounded, filled, small, icon } = props;
      return {
        [`${NAME}--outlined`]:
          variants.value.includes('outlined') || outlined,
        [`${NAME}--rounded`]: variants.value.includes('rounded') || rounded,
        [`${NAME}--filled`]: variants.value.includes('filled') || filled,
        [`${NAME}--tonal`]: variants.value.includes('tonal'),
        [`${NAME}--text`]: variants.value.includes('text'),
        [`${NAME}--small`]: variants.value.includes('small') || small,
        [`${NAME}--x-small`]: variants.value.includes('x-small') || small,
        [`${NAME}--icon`]: variants.value.includes('icon') || icon,
        [`${NAME}--color`]: props.color,
        [`${NAME}--loading`]: props.loading,
        [`${NAME}--disabled`]: props.disabled,
        [`${NAME}--active`]: isActive.value,
      };
    });

    const styles = computed(() => {
      let { color } = props;
      let textColor: string | undefined;
      if (color && !isColorValue(color)) {
        color = `var(--y-theme-${color})`;
        textColor = `var(--y-theme-on-${props.color})`;
      }

      return {
        [`--y-button__color`]: color,
        [`--y-button__text-color`]: textColor,
        [`--y-button__size`]: props.size,
      };
    });

    const isDisabled = computed(() => {
      return choice?.disabled.value || props.disabled;
    });

    /// Events
    function onClick(e: MouseEvent) {
      if (
        isDisabled.value ||
        props.loading ||
        (link.isLink.value &&
          (e.metaKey ||
            e.altKey ||
            e.ctrlKey ||
            e.shiftKey ||
            e.button !== 0 ||
            attrs.target === '_blank'))
      ) {
        return;
      }
      emit('click', e);
      link.navigate?.(e);
      choice?.toggle();
    }

    useRender(() => {
      const Tag = link.isLink.value ? 'a' : 'button';
      return (
        <Tag
          type={Tag === 'a' ? undefined : 'button'}
          class={[
            `${NAME}`,
            choice?.selectedClass.value,
            {
              ...classes.value,
            },
          ]}
          href={props.disabled ? undefined : link.href.value}
          style={styles.value}
          tabindex={props.tabindex}
          onClick={onClick}
          disabled={props.disabled ? true : undefined}
          v-plate-wave={!props.noWave && !props.loading}
        >
          <span class={['y-button__content']}>
            {props.loading &&
              (slots.loading ? (
                slots.loading?.()
              ) : (
                <YSpinnerRing
                  {...mergeProps({ width: '24', height: '24' })}
                ></YSpinnerRing>
              ))}
            {slots.default?.()}
          </span>
          {slots.append?.()}
        </Tag>
      );
    });

    return {
      link,
    };
  },
});

export type YButton = InstanceType<typeof YButton>;
