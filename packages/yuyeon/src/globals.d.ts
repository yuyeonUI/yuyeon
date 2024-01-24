import type { VNode } from "vue";
import type {NativeElements, ReservedProps} from "@vue/runtime-dom";

export namespace JSX {
  export interface Element extends VNode {}
  export interface ElementClass {
    $props: {}
  }
  export interface ElementAttributesProperty {
    $props: {}
  }
  export interface IntrinsicElements extends NativeElements {
    [name: string]: any
  }
  export interface IntrinsicAttributes extends ReservedProps {}
}
