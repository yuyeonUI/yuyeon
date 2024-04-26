import type { Ref } from "vue";

export interface CoordinateState {
  contentEl: Ref<HTMLElement | undefined>;
  base: Ref<HTMLElement | [x: number, y: number] | undefined>;
  active: Ref<boolean>;
}
