import type {
  ComponentInternalInstance,
  ComponentPublicInstance,
  InjectionKey,
  VNode,
  VNodeChild,
} from 'vue';
import { getCurrentInstance } from 'vue';

import { defineComponent } from './component';

export type { EventProp } from './types';
export * from './props';

export { defineComponent };

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
  return vm?.uid?.toString() ?? Math.random().toString(36).slice(2);
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

export function getHtmlElement(
  node: ComponentPublicInstance | Element | undefined,
): HTMLElement | undefined {
  if (!node) {
    return undefined;
  }

  const el = '$el' in node ? (node.$el as HTMLElement) : node;

  if (el.nodeType === Node.TEXT_NODE || el.nodeType === Node.COMMENT_NODE) {
    return el.nextElementSibling instanceof HTMLElement
      ? el.nextElementSibling
      : undefined;
  }

  return el instanceof HTMLElement ? el : undefined;
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
