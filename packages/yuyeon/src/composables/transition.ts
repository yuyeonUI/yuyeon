import {
  type Component,
  type FunctionalComponent,
  type PropType,
  Transition,
  type TransitionProps,
  computed,
  h,
} from 'vue';

import { propsFactory } from '@/util/component/props';

export const pressPolyTransitionPropsOptions = propsFactory(
  {
    transition: {
      type: [String, Object] as PropType<
        string | (TransitionProps & { is?: Component })
      >,
      default: 'slide-fade',
    },
  },
  'PolyTransition',
);

export function usePolyTransition(props: { transition: any }) {
  const polyTransitionBindProps = computed(() => {
    const { is, ...transitionProps } =
      typeof props.transition === 'object'
        ? props.transition
        : { is: props.transition, name: props.transition };
    return {
      is,
      transitionProps,
    };
  });

  return {
    polyTransitionBindProps,
  };
}

export const PolyTransition: FunctionalComponent<
  TransitionProps & { is: string | Component; transitionProps: TransitionProps }
> = (props, { slots }) => {
  const { is, transitionProps, ...forcedProps } = props;
  const { component = Transition, ...rest } =
    typeof is === 'object'
      ? { component: is, ...transitionProps }
      : { name: is };
  return h(component, { ...rest, ...transitionProps, ...forcedProps }, slots);
};
