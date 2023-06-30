import type { Ref } from "vue";

export interface CoordinateState {
  contentEl: Ref<HTMLElement | undefined>;
  baseEl: Ref<HTMLElement | undefined>;
  active: Ref<boolean>;
}
