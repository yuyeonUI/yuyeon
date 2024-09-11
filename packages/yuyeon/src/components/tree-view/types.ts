import { type ComponentPublicInstance } from 'vue';

import type { CandidateKey } from '@/types';

export interface NodeState {
  childKeys: CandidateKey[];
  item: any;
  parentKey: null | CandidateKey;
  vnode: null | ComponentPublicInstance;
  level: number;
  //
  selected: false;
  indeterminate: false;
  active: false;
  expanded: false;
}

export type TreeviewFilterFn = (
  item: any,
  search: string,
  itemText: string,
) => boolean;
