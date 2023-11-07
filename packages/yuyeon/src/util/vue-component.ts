import { ComponentInternalInstance, capitalize } from '@vue/runtime-core';
import type { IfAny } from '@vue/shared';
import type {
  ComponentObjectPropsOptions,
  ComponentPublicInstance,
  ExtractPropTypes,
  InjectionKey,
  Prop,
  PropType,
  VNode,
  VNodeChild,
} from 'vue';
import { getCurrentInstance } from 'vue';

import { hasOwnProperty } from './common';

export function getSlot(
  vm: ComponentPublicInstance | any,
  // eslint-disable-next-line default-param-last
  name = 'default',
  data?: any | (() => any),
  optional = false,
): VNode[] | undefined {
  if (vm.$slots?.[name]) {
    const slot = vm.$slots[name]!(data instanceof Function ? data() : data);
    return slot.filter((node: VNode) => {
      return node.el?.nodeType !== 8;
    });
  }
  return undefined;
}

export function getUid() {
  const vm = getCurrentInstance();
  return vm?.uid;
}

export function chooseProps<PropsOptions extends ComponentObjectPropsOptions>(
  props: any,
  target: PropsOptions,
): ExtractPropTypes<PropsOptions> {
  return Object.keys(target).reduce((acc, prop) => {
    if (props && prop in props) {
      acc[prop as keyof ExtractPropTypes<PropsOptions>] = props[prop];
    }
    return acc;
  }, {} as ExtractPropTypes<PropsOptions>);
}

export function bindClasses(
  classes: string | string[] | Record<string, any> | undefined,
) {
  const boundClasses = {} as Record<string, boolean>;
  if (typeof classes === 'string') {
    boundClasses[classes] = true;
  } else if (Array.isArray(classes)) {
    (classes as string[]).reduce((acc, clas) => {
      acc[clas] = true;
      return acc;
    }, boundClasses);
  } else if (typeof classes === 'object') {
    Object.keys(classes).reduce((acc, clas) => {
      acc[clas] = !!classes[clas];
      return acc;
    }, boundClasses);
  }
  return boundClasses;
}

export function getHtmlElement<N extends object | undefined>(
  node: N,
): Exclude<N, ComponentPublicInstance> | HTMLElement {
  return node && hasOwnProperty(node, '$el')
    ? ((node as ComponentPublicInstance).$el as HTMLElement)
    : (node as HTMLElement);
}

export function findChildrenWithProvide(
  key: InjectionKey<any> | symbol,
  vnode?: VNodeChild,
): ComponentInternalInstance[] {
  if (!vnode || typeof vnode !== 'object') {
    return [];
  }

  if (Array.isArray(vnode)) {
    return vnode.map((child) => findChildrenWithProvide(key, child)).flat(1);
  } else if (Array.isArray(vnode.children)) {
    return vnode.children
      .map((child) => findChildrenWithProvide(key, child))
      .flat(1);
  } else if (vnode.component) {
    if (
      Object.getOwnPropertySymbols((vnode.component as any).provides).includes(
        key as symbol,
      )
    ) {
      return [vnode.component];
    } else if (vnode.component.subTree) {
      return findChildrenWithProvide(key, vnode.component.subTree).flat(1);
    }
  }

  return [];
}

export function propsFactory<PropsOptions extends ComponentObjectPropsOptions>(
  props: PropsOptions,
  source: string,
) {
  return <Defaults extends PartialKeys<PropsOptions> = {}>(
    defaults?: Defaults,
  ): OverwrittenPropOptions<PropsOptions, Defaults> => {
    return Object.keys(props).reduce<any>((options, prop) => {
      const option = props[prop];
      const isObjectOption =
        typeof option === 'object' && option != null && !Array.isArray(option);
      const objectOption = isObjectOption ? option : { type: option };
      if (defaults && prop in defaults) {
        options[prop] = {
          ...objectOption,
          default: defaults[prop],
        };
      } else {
        options[prop] = objectOption;
      }

      if (source && !options[prop].source) {
        options[prop].source = source;
      }
      return options;
    }, {} as PropsOptions);
  };
}

export function hasEventProp(props: Record<string, any>, type: string) {
  const onType = `on${capitalize(type)}`;
  return !!(
    props[onType] ||
    props[`${onType}Once`] ||
    props[`${onType}Capture`] ||
    props[`${onType}OnceCapture`] ||
    props[`${onType}CaptureOnce`]
  );
}

type OverwrittenPropOptions<
  T extends ComponentObjectPropsOptions,
  D extends PartialKeys<T>,
> = {
  [P in keyof T]-?: unknown extends D[P]
    ? T[P]
    : T[P] extends Record<string, unknown>
    ? Omit<T[P], 'type' | 'default'> & {
        type: PropType<MergeDefault<T[P], D[P]>>;
        default: MergeDefault<T[P], D[P]>;
      }
    : {
        type: PropType<MergeDefault<T[P], D[P]>>;
        default: MergeDefault<T[P], D[P]>;
      };
};

type MergeDefault<T, D> = unknown extends D
  ? InferPropType<T>
  : NonNullable<InferPropType<T>> | D;

type FollowPropType<T, P, D> = [T] extends [PropType<unknown>]
  ? T
  : PropType<MergeDefault<P, D>>;

type PartialKeys<T> = { [P in keyof T]?: unknown };

// Copied from Vue
type InferPropType<T> = [T] extends [null]
  ? any // null & true would fail to infer
  : [T] extends [{ type: null | true }]
  ? // As TS issue https://github.com/Microsoft/TypeScript/issues/14829
    // somehow `ObjectConstructor` when inferred from { (): T } becomes `any`
    // `BooleanConstructor` when inferred from PropConstructor(with PropMethod) becomes `Boolean`
    any
  : [T] extends [ObjectConstructor | { type: ObjectConstructor }]
  ? Record<string, any>
  : [T] extends [BooleanConstructor | { type: BooleanConstructor }]
  ? boolean
  : [T] extends [DateConstructor | { type: DateConstructor }]
  ? Date
  : [T] extends [(infer U)[] | { type: (infer U)[] }]
  ? U extends DateConstructor
    ? Date | InferPropType<U>
    : InferPropType<U>
  : [T] extends [Prop<infer V, infer D>]
  ? unknown extends V
    ? IfAny<V, V, D>
    : V
  : T;

export type EventProp<T extends any[] = any[], F = (...args: T) => any> =
  | F
  | F[];

export const EventPropOption = <T extends any[] = any[]>() =>
  [Function, Array] as PropType<EventProp<T>>;
