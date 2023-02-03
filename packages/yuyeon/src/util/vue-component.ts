/*
 * Created by yeonyu 2022.
 */

import { VNode, ComponentPublicInstance } from 'vue';

export function getSlot(
  vm: ComponentPublicInstance | any,
  // eslint-disable-next-line default-param-last
  name = 'default',
  data?: any | (() => any),
  optional = false,
): VNode[] | undefined {
  if (vm.$slots?.[name]) {
    return vm.$slots[name]!(data instanceof Function ? data() : data);
  }
  return undefined;
}
