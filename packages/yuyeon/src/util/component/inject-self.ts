import {
  type ComponentInternalInstance,
  type InjectionKey,
  getCurrentInstance,
} from 'vue';

export function injectSelf<T>(
  key: InjectionKey<T> | string,
  vm?: ComponentInternalInstance,
): T | undefined;
export function injectSelf(
  key: InjectionKey<any> | string,
  vm = getCurrentInstance(),
) {
  const provides = vm?.provides;

  if (provides && (key as string | symbol) in provides) {
    return provides[key as string];
  }

  return undefined;
}
