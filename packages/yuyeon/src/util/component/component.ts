import {
  ComponentObjectPropsOptions,
  ComponentOptionsWithoutProps,
  ExtractDefaultPropTypes,
  ExtractPropTypes,
  FunctionalComponent,
  defineComponent,
} from 'vue';
import type {
  Component,
  ComponentInjectOptions,
  ComponentOptions,
  ComponentOptionsMixin,
  ComponentPropsOptions,
  ComponentProvideOptions,
  ComputedOptions,
  DefineComponent,
  Directive,
  EmitsOptions,
  MethodOptions,
  SlotsType,
} from 'vue';

import {
  useDefaultsModule,
  useSuperDefaults,
} from '../../composables/defaults';
import { EmitsToProps } from './types';
import { ComponentOptionsWithObjectProps } from '@vue/runtime-core';

type ToResolvedProps<Props, Emits extends EmitsOptions> = Readonly<Props> &
  Readonly<EmitsToProps<Emits>>;

// overload 1: no props from options
function redefineComponent<
  // props
  PropsOptions = {},
  //
  RawBindings = {},
  // emits
  E extends EmitsOptions = {},
  EE extends string = string,
  // other options
  Data = {},
  SetupBindings = {},
  Computed extends ComputedOptions = {},
  Methods extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  InjectOptions extends ComponentInjectOptions = {},
  InjectKeys extends string = string,
  Slots extends SlotsType = {},
  LocalComponents extends Record<string, Component> = {},
  Directives extends Record<string, Directive> = {},
  Exposed extends string = string,
  Provide extends ComponentProvideOptions = ComponentProvideOptions,
>(
  options: ComponentOptionsWithoutProps<
    PropsOptions,
    RawBindings,
    Data,
    Computed,
    Methods,
    Mixin,
    Extends,
    E,
    EE,
    InjectOptions,
    InjectKeys,
    Slots
  >,
): DefineComponent<
  PropsOptions,
  RawBindings,
  Data,
  Computed,
  Methods,
  Mixin,
  Extends,
  E,
  EE
>;

// overload 2: defineComponent with options object, infer props from options
function redefineComponent<
  // props
  PropsOptions = ComponentObjectPropsOptions,
  RawBindings = {},
  // emits
  E extends EmitsOptions = {},
  EE extends string = string,
  // other options
  Data = {},
  SetupBindings = {},
  Computed extends ComputedOptions = {},
  Methods extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  Defaults = ExtractDefaultPropTypes<PropsOptions>,
  InjectOptions extends {} = {},
  InjectKeys extends string = string,
  Slots extends SlotsType = {},
  LocalComponents extends Record<string, Component> = {},
  Directives extends Record<string, Directive> = {},
  Exposed extends string = string,
  Provide extends ComponentProvideOptions = ComponentProvideOptions,
>(
  options: ComponentOptionsWithObjectProps<
    PropsOptions,
    RawBindings,
    Data,
    Computed,
    Methods,
    Mixin,
    Extends,
    E,
    EE,
    InjectOptions,
    InjectKeys,
    Slots
  >,
): DefineComponent<
  PropsOptions,
  RawBindings,
  Data,
  Computed,
  Methods,
  Mixin,
  Extends,
  E,
  EE
>;

function redefineComponent(options: ComponentOptions) {
  options._setup = options._setup ?? options.setup;

  if (options._setup) {
    options.setup = function (props, ctx) {
      const defaults = useDefaultsModule();
      // Skip props proxy if defaults are not provided
      if (!defaults.value) return options._setup(props, ctx);

      const { props: _props, provideSubDefaults } = useSuperDefaults(
        props,
        options.name,
        defaults,
      );

      const setupBindings = options._setup(_props, ctx);

      provideSubDefaults();

      return setupBindings;
    };
  }

  return options;
}

function defineFunctionalComponent<
  T extends FunctionalComponent<Props>,
  PropsOptions = ComponentObjectPropsOptions,
  Defaults = ExtractDefaultPropTypes<PropsOptions>,
  Props = Readonly<ExtractPropTypes<PropsOptions>>,
>(
  props: PropsOptions,
  context: T,
): FunctionalComponent<Partial<Defaults> & Omit<Props, keyof Defaults>> {
  context.props = props as any;
  return context as any;
}

export { redefineComponent as defineComponent };
