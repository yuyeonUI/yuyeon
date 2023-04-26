import {
  Component,
  FunctionalComponent,
  PropType,
  Transition,
  TransitionProps,
  computed,
  h,
} from 'vue';

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

export const polyTransitionPropOptions = {
  transition: {
    type: [String, Object] as PropType<
      string | (TransitionProps & { is?: Component })
    >,
    default: 'slide-fade',
  },
};

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
