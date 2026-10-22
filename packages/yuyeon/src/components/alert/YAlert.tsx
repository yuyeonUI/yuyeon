import { computed, type PropType, ref, type SlotsType } from 'vue';

import { useRender } from '@/composables/component';
import { defineComponent } from '@/util/component';
import { toKebabCase } from '@/util/string';

import { YPlate } from '../plate';

import './YAlert.scss';

const NAME = 'YAlert';
const KEBAB_NAME = toKebabCase(NAME);

const YAlertPropOptions = {
  semantic: String as PropType<
    'info' | 'warning' | 'success' | 'error' | string
  >,
  variant: String as PropType<'outlined' | 'filled' | string>,
  /** @deprecated Use `variant` instead. */
  variation: String as PropType<'outlined' | 'filled' | string>,
  color: String as PropType<string>,
  textColor: String as PropType<string>,
  outlineColor: String as PropType<string>,
};

/**
 * #  Component
 */
export const YAlert = defineComponent({
  name: NAME,
  props: {
    ...YAlertPropOptions,
  },
  slots: Object as SlotsType<{
    leading: any;
    trailing: any;
    title: any;
    default: any;
  }>,
  setup(props, { slots }) {
    const el$ = ref<HTMLElement>();

    const variants = computed(() => {
      const variant = props.variant ?? props.variation;
      if (variant) {
        return variant
          .split(',')
          .map((value) => {
            return value.trim();
          })
          .filter((v) => !!v);
      }
      return [];
    });

    const cssVariables = computed(() => {
      const ret: Record<string, string | number> = {};

      if (props.color) {
        ret['--y-alert-surface-color'] = props.color;
        if (variants.value.includes('filled')) {
          ret['--y-alert-surface-opacity'] = 1;
        } else {
          ret['--y-alert-text-color'] = props.color;
        }
        if (props.textColor) {
          ret['--y-alert-text-color'] = props.textColor;
        }
        if (!props.outlineColor && !props.semantic) {
          ret['--y-alert-outline-color'] = props.color;
        }
      }
      if (props.outlineColor) {
        ret['--y-alert-outline-color'] = props.outlineColor;
      }
      return ret;
    });

    useRender(() => (
      <div
        ref={el$}
        class={[
          KEBAB_NAME,
          {
            [`y-alert--${props.semantic}`]: props.semantic,
            'y-alert--filled': variants.value.includes('filled'),
            'y-alert--outlined': variants.value.includes('outlined'),
          },
        ]}
        style={cssVariables.value}
        v-theme
      >
        <YPlate></YPlate>
        {slots.leading && (
          <div class={['y-alert__leading']}>{slots.leading()}</div>
        )}
        <div class={['y-alert__content']}>
          {slots.title && <div class={['y-alert__title']}>{slots.title()}</div>}
          {slots.default?.()}
        </div>
        {slots.trailing && (
          <div class={['y-alert__trailing']}>{slots.trailing()}</div>
        )}
      </div>
    ));
  },
});

export type YAlert = InstanceType<typeof YAlert>;
