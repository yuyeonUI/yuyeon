import { capitalize } from 'vue';
import type { IfAny } from '@vue/shared';
import type {
  ComponentObjectPropsOptions,
  ExtractPropTypes,
  Prop,
  PropType,
  VNode,
} from 'vue';

import { toKebabCase } from '../string';

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

export function propIsDefined(vnode: VNode, prop: string) {
  return (
    typeof vnode.props?.[prop] !== 'undefined' ||
    typeof vnode.props?.[toKebabCase(prop)] !== 'undefined'
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
