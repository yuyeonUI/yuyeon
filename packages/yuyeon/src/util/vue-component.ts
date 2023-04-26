/*
 * Created by yeonyu 2022.
 */
import { ComponentPublicInstance, VNode } from 'vue';

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

export function bindClasses(classes: string | string[] | Record<string, any> | undefined) {
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
