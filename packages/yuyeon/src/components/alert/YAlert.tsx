import { type PropType, type SlotsType, computed, ref } from 'vue';

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

    const variations = computed(() => {
      const { variation } = props;
      if (variation) {
        return variation
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
        if (variations.value.includes('filled')) {
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
            'y-alert--filled': variations.value.includes('filled'),
            'y-alert--outlined': variations.value.includes('outlined'),
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
