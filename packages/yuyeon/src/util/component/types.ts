import type { EmitsOptions, ObjectEmitsOptions, PropType } from 'vue';

export type EventProp<T extends any[] = any[], F = (...args: T) => any> =
  | F
  | F[];

export const EventPropOption = <T extends any[] = any[]>() =>
  [Function, Array] as PropType<EventProp<T>>;

export type ComponentTypeEmits =
  | ((...args: any[]) => any)
  | Record<string, any[]>

export type EmitsToProps<T extends EmitsOptions | ComponentTypeEmits> =
  T extends string[]
    ? {
      [K in `on${Capitalize<T[number]>}`]?: (...args: any[]) => any
    }
    : T extends ObjectEmitsOptions
      ? {
        [K in string & keyof T as `on${Capitalize<K>}`]?: (
          ...args: T[K] extends (...args: infer P) => any
            ? P
            : T[K] extends null
              ? any[]
              : never
        ) => any
      }
      : {}

export type TypeEmitsToOptions<T extends ComponentTypeEmits> = {
  [K in keyof T & string]: T[K] extends [...args: infer Args]
    ? (...args: Args) => any
    : () => any
} & (T extends (...args: any[]) => any
  ? ParametersToFns<OverloadParameters<T>>
  : {})

type ParametersToFns<T extends any[]> = {
  [K in T[0]]: K extends `${infer C}`
    ? (...args: T extends [C, ...infer Args] ? Args : never) => any
    : never
}

export type OverloadParameters<T extends (...args: any[]) => any> = Parameters<
  OverloadUnion<T>
>

type OverloadProps<TOverload> = Pick<TOverload, keyof TOverload>

type OverloadUnionRecursive<
  TOverload,
  TPartialOverload = unknown,
> = TOverload extends (...args: infer TArgs) => infer TReturn
  ? TPartialOverload extends TOverload
    ? never
    :
    | OverloadUnionRecursive<
    TPartialOverload & TOverload,
    TPartialOverload &
    ((...args: TArgs) => TReturn) &
    OverloadProps<TOverload>
  >
    | ((...args: TArgs) => TReturn)
  : never

type OverloadUnion<TOverload extends (...args: any[]) => any> = Exclude<
  OverloadUnionRecursive<(() => never) & TOverload>,
  TOverload extends () => never ? never : () => never
>
