import { SlotsType, computed } from 'vue';

import { useRender } from '@/composables/component';
import { pressThemePropsOptions, useLocalTheme } from '@/composables/theme';
import { defineComponent, propsFactory } from '@/util/component';

import './YListItem.scss';

export const pressYListItemProps = propsFactory(
  {
    tag: {
      type: String,
      default: 'div',
    },
    onClick: Function,
    disabled: Boolean,
    ...pressThemePropsOptions(),
  },
  'YListItem',
);

export const YListItem = defineComponent({
  name: 'YListItem',
  props: {
    ...pressYListItemProps(),
  },
  emits: {
    click: (e: MouseEvent) => true,
  },
  slots: Object as SlotsType<{
    default: any;
    leading: any;
    trailing: any;
  }>,
  setup(props, { slots, emit }) {
    const { themeClasses } = useLocalTheme(props);

    function onClick(e: MouseEvent) {
      emit('click', e);
    }

    const clickable = computed(() => {
      return !props.disabled && !!props.onClick;
    });

    useRender(() => {
      const ElTag = props.tag as keyof HTMLElementTagNameMap;
      return (
        <ElTag
          class={[
            'y-list-item',
            {
              'y-list-item--pointer': clickable.value,
              'y-list-item--disabled': props.disabled,
            },
            themeClasses.value,
          ]}
          onClick={onClick}
        >
          {slots.leading && (
            <div class={'y-list-item__leading'}>{slots.leading()}</div>
          )}
          <div class={'y-list-item__content'}>{slots.default?.()}</div>
          {slots.trailing && (
            <div class={'y-list-item__trailing'}>{slots.trailing()}</div>
          )}
        </ElTag>
      );
    });
  },
});

export type YListItem = InstanceType<typeof YListItem>;
