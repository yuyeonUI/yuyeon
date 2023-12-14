import { HTMLAttributes } from '@vue/runtime-dom';
import type { Component, InjectionKey, PropType, Ref } from 'vue';
import { computed, defineComponent, inject, mergeProps, unref } from 'vue';

import { builtSet } from '../components';
import { JSXComponent } from '../types';
import { mergeDeep, propsFactory } from '../util';

type IconComponent = JSXComponent<IconProps>;

export type IconValue =
  | string
  | (string | [path: string, opacity: number])[]
  | IconComponent
  | { component: JSXComponent; props?: any }
  | { alias: string; iconProps?: any };

export const IconPropOption = [
  String,
  Function,
  Object,
  Array,
] as PropType<IconValue>;

type IconProps = {
  tag: string;
  icon?: IconValue;
  disabled?: Boolean;
};

export interface IconSet {
  component: IconComponent;
}

export const IconValue = [
  String,
  Object,
  Array,
  Function,
] as PropType<IconValue>;

export type IconModuleOptions = {
  defaultSet?: string;
  sets?: Record<string, IconSet>;
  aliases?: Partial<Record<string, any>>;
};

export const pressIconPropsOptions = propsFactory(
  {
    icon: {
      type: IconValue,
    },
    tag: {
      type: String,
      required: true,
    },
  },
  'icon',
);

export const YComponentIcon = defineComponent({
  name: 'YComponentIcon',
  props: pressIconPropsOptions(),
  setup(props, { slots }) {
    return () => {
      const icon = props.icon as unknown;
      let Icon: JSXComponent = () => <></>;
      let iconProps: any = {};
      if (icon instanceof Object) {
        Icon = icon as JSXComponent;
        if ('component' in icon) {
          Icon = icon.component as JSXComponent;
          iconProps = (icon as any)?.props;
        }
      }
      return (
        <props.tag>
          {props.icon ? <Icon {...mergeProps(iconProps)} /> : slots.default?.()}
        </props.tag>
      );
    };
  },
});
export type YComponentIcon = InstanceType<typeof YComponentIcon>;

export const YSvgIcon = defineComponent({
  name: 'YSvgIcon',
  inheritAttrs: false,
  props: pressIconPropsOptions(),
  setup(props, { attrs }) {
    return () => {
      return (
        <props.tag {...attrs}>
          <svg
            class="y-icon__svg"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            role="img"
            aria-hidden="true"
          >
            {Array.isArray(props.icon) ? (
              props.icon.map((path) =>
                Array.isArray(path) ? (
                  <path d={path[0] as string} fill-opacity={path[1]}></path>
                ) : (
                  <path d={path as string}></path>
                ),
              )
            ) : (
              <path d={props.icon as string}></path>
            )}
          </svg>
        </props.tag>
      );
    };
  },
});
export type YSvgIcon = InstanceType<typeof YSvgIcon>;

export const YUYEON_ICON_KEY: InjectionKey<Required<IconModuleOptions>> =
  Symbol.for('yuyeon.icon');

export function createIconModule(options?: IconModuleOptions) {
  return mergeDeep(
    {
      defaultSet: 'built',
      sets: {
        svg: {
          component: YSvgIcon,
        },
      },
      aliases: {
        ...builtSet,
      },
    },
    options,
  );
}

type IconInstance = {
  component: IconComponent;
  icon?: IconValue;
};

export function useIcon(iconProp: Ref<IconValue | undefined>) {
  const iconModule = inject(YUYEON_ICON_KEY);

  if (!iconModule) throw new Error('Not found provided "IconModule"');

  const iconData = computed<IconInstance>(() => {
    const iconMeta = unref(iconProp);

    if (!iconMeta) return { component: YComponentIcon };

    let icon: IconValue | undefined = iconMeta;

    if (
      typeof icon === 'object' &&
      'alias' in icon &&
      typeof icon.alias === 'string'
    ) {
      icon = icon.alias;
    }

    if (typeof icon === 'string') {
      icon = icon.trim();

      if (icon.startsWith('$')) {
        icon = iconModule.aliases?.[icon.slice(1)];
      }
    }

    if (!icon) throw new Error(`Could not find aliased icon "${iconMeta}"`);

    if (Array.isArray(icon)) {
      return {
        component: YSvgIcon,
        icon,
      };
    } else if (typeof icon !== 'string') {
      const iconValue = unref(iconProp);
      console.log(iconValue);
      if (
        iconValue &&
        typeof iconValue === 'object' &&
        'iconProps' in iconValue
      ) {
        icon = {
          component:
            'component' in icon ? icon.component : (icon as JSXComponent),
          props:
            'props' in icon
              ? mergeDeep(icon.props, iconValue?.iconProps ?? {})
              : iconValue.iconProps,
        };
      }
      return {
        component: YComponentIcon,
        icon,
      };
    }

    const iconSetName = Object.keys(iconModule.sets).find(
      (setName) => typeof icon === 'string' && icon.startsWith(`${setName}:`),
    );

    const iconName = iconSetName ? icon.slice(iconSetName.length + 1) : icon;
    const iconSet = iconModule.sets[iconSetName ?? iconModule.defaultSet];

    return {
      icon: iconName,
      component: iconSet.component,
    };
  });

  return {
    iconData,
  };
}
