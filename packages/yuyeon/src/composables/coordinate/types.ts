import type { Ref } from 'vue';

import { XYPoint } from '@/types';

export interface CoordinateState {
  contentEl: Ref<HTMLElement | undefined>;
  base: Ref<Element | XYPoint | undefined>;
  pivot: Ref<any>;
  active: Ref<boolean>;
  placement?: Ref<any>;
}
