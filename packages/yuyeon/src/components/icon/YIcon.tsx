import { type PropType, computed, ref } from 'vue';

import { useRender } from '@/composables/component';
import { IconValue, useIcon } from '@/composables/icon';
import { pressThemePropsOptions, useLocalTheme } from '@/composables/theme';
import { defineComponent } from '@/util/component';
import { propsFactory } from '@/util/component';
import { toStyleSizeValue } from '@/util/ui';

import './YIcon.scss';

export const pressYIconPropsOptions = propsFactory(
  {
    color: String,
    gap: String,
    icon: IconValue,
    tag: {
      type: String,
      default: 'i',
    },
    size: {
      type: [String, Number],
    },
    class: [String, Array] as PropType<any>,
    ...pressThemePropsOptions(),
  },
  'YIcon',
);

export const YIcon = defineComponent({
  name: 'YIcon',
  props: pressYIconPropsOptions(),
  setup(props, { attrs, slots }) {
    const iconCode = ref<string>();

    const { themeClasses } = useLocalTheme(props);
    const { iconData } = useIcon(computed(() => iconCode.value || props.icon));

    useRender(() => {
      const defaultSlot = slots.default?.();
      if (defaultSlot) {
        iconCode.value = defaultSlot.filter(
          (node) =>
            node.type === Text &&
            node.children &&
            typeof node.children === 'string',
        )[0]?.children as string;
      }

      return (
        <iconData.value.component
          tag={props.tag}
          icon={iconData.value.icon}
          class={[
            'y-icon',
            'notranslate',
            themeClasses.value,
            {
              'y-icon--clickable': !!attrs.onClick,
            },
            props.class,
          ]}
          style={{
            fontSize: toStyleSizeValue(props.size),
            width: toStyleSizeValue(props.size),
            height: toStyleSizeValue(props.size),
          }}
          role={attrs.onClick ? 'button' : undefined}
          aria-hidden={!attrs.onClick}
        >
          {defaultSlot}
        </iconData.value.component>
      );
    });
  },
});

export type YIconIconProp = IconValue & Omit<PropType<YIcon['$props']>, 'icon'>;

export type YIcon = InstanceType<typeof YIcon>;
