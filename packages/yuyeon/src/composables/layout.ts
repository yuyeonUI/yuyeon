import { InjectionKey, provide } from "vue";

declare function register(): void;

interface LayoutProvide {
  register: typeof register;
  unregister: (id: string) => void;
}

export const YUYEON_LAYOUT_KEY: InjectionKey<LayoutProvide> = Symbol.for('yuyeon.layout');

export function initLayoutSystem() {
  provide(YUYEON_LAYOUT_KEY, {
    register: () => {
      return;
    },
    unregister: () => {
      return;
    }
  })
}
