import "vue/jsx";
import type { VNode } from "vue";

declare global {
  namespace JSX {
    interface Element extends VNode {}

    interface IntrinsicAttributes {
      [name: string]: any
    }
  }
}

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
  }

  export interface ComponentInternalInstance {
    provides: Record<string, unknown>
  }
}
