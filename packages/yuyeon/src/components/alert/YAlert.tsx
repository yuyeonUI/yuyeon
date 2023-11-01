import { PropType, defineComponent, ref } from 'vue';

import { useRender } from '../../composables/component';
import { toKebabCase } from '../../util/string';
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
  setup(looseProps, { slots }) {
    const el$ = ref<HTMLElement>();

    useRender(() => (
      <div
        ref={el$}
        class={[
          KEBAB_NAME,
          { [`y-alert--${looseProps.semantic}`]: looseProps.semantic },
        ]}
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
