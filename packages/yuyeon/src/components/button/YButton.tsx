import type { PropType } from 'vue';
import { computed, defineComponent, mergeProps } from 'vue';

import {
  pressChoiceItemPropsOptions,
  useChoiceItem,
} from '../../composables/choice';
import { useRender } from '../../composables/component';
import {
  pressVueRouterPropsOptions,
  useLink,
} from '../../composables/vue-router';
import { PlateWave } from '../../directives/plate-wave';
import { isColorValue } from '../../util/color';
import { propsFactory } from '../../util/vue-component';
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
  emits: {
    'choice:selected': (choice: { value: boolean }) => true,
  },
  setup(props, { attrs, slots }) {
    const choice = useChoiceItem(props, props.injectSymbol, false);
    const link = useLink(props, attrs);

    const isActive = computed(() => {
      if (props.active !== undefined) {
        return props.active;
      }
      if (link.isLink.value) {
        return link.isActive?.value;
      }
      return choice?.isSelected.value;
    });

    const variations = computed(() => {
      const { variation } = props;
      if (typeof variation === 'string') {
        return variation.split(',').map((value) => {
          return value.trim();
        });
      }
      return [];
    });

    const classes = computed(() => {
      const { outlined, rounded, filled, small, icon } = props;
      return {
        [`${NAME}--outlined`]:
          variations.value.includes('outlined') || outlined,
        [`${NAME}--rounded`]: variations.value.includes('rounded') || rounded,
        [`${NAME}--filled`]: variations.value.includes('filled') || filled,
        [`${NAME}--text`]: variations.value.includes('text'),
        [`${NAME}--small`]: variations.value.includes('small') || small,
        [`${NAME}--icon`]: variations.value.includes('icon') || icon,
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
      };
    });

    /// Events
    function onClick(e: MouseEvent) {
      e.preventDefault();
      if (props.loading) {
        return;
      }
      link.navigate?.(e);
      choice?.toggle();
    }

    useRender(() => {
      return (
        <button
          class={[
            `${NAME}`,
            choice?.selectedClass.value,
            {
              ...classes.value,
            },
          ]}
          style={styles.value}
          onClick={onClick}
          disabled={props.disabled ? true : undefined}
          v-plate-wave={!props.noWave && !props.loading}
        >
          <span class={['y-button__content']}>
            {props.loading && (
              <YSpinnerRing
                {...mergeProps({ width: '24', height: '24' })}
              ></YSpinnerRing>
            )}
            {slots.default?.()}
          </span>
          {slots.append?.()}
        </button>
      );
    });
  },
});

export type YButton = InstanceType<typeof YButton>;
