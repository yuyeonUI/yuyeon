import type { ComputedRef, PropType, Ref, SetupContext } from 'vue';
import { computed, resolveDynamicComponent, toRef } from 'vue';
import type {
  RouteLocationRaw,
  UseLinkOptions,
  RouterLink as VueRouterLink,
} from 'vue-router';
import { useLink as _useLink } from 'vue-router';

import { type EventProp, hasEventProp, propsFactory } from '@/util/component';

export interface LinkProps {
  href: string | undefined;
  replace: boolean | undefined;
  to: RouteLocationRaw | undefined;
  exact: boolean | undefined;
}

export interface LinkListeners {
  onClick?: EventProp | undefined;
  onClickOnce?: EventProp | undefined;
}

export const pressVueRouterPropsOptions = propsFactory(
  {
    href: String,
    replace: Boolean,
    to: [String, Object] as PropType<RouteLocationRaw>,
    exact: Boolean,
  },
  'VueRouter',
);

export interface UseLink
  extends Omit<Partial<ReturnType<typeof _useLink>>, 'href'> {
  isLink: ComputedRef<boolean>;
  isClickable: ComputedRef<boolean>;
  href: Ref<string | undefined>;
}

export function useLink(
  props: LinkProps & LinkListeners,
  attrs: SetupContext['attrs'],
): UseLink {
  const RouterLink = resolveDynamicComponent('RouterLink') as
    | typeof VueRouterLink
    | string;

  const isLink = computed(() => !!(props.href || props.to));
  const isClickable = computed(() => {
    return (
      isLink?.value ||
      hasEventProp(attrs, 'click') ||
      hasEventProp(props, 'click')
    );
  });
  if (typeof RouterLink === 'string') {
    return {
      isLink,
      isClickable,
      href: toRef(props, 'href'),
    };
  }
  const link = props.to
    ? RouterLink.useLink(props as UseLinkOptions)
    : undefined;
  return {
    isLink,
    isClickable,
    route: link?.route,
    navigate: link?.navigate,
    isActive:
      link &&
      computed(() =>
        props.exact ? link.isExactActive?.value : link.isActive?.value,
      ),
    href: computed(() => (props.to ? link?.route.value.href : props.href)),
  };
}
