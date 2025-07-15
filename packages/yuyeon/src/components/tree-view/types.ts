import { type ComponentPublicInstance } from 'vue';

import type { CandidateKey } from '@/types';

export interface ItemState {
  selected: boolean;
  indeterminate: boolean;
  active: boolean;
  expanded: boolean;
}

export interface NodeState extends ItemState {
  childKeys: CandidateKey[];
  item: any;
  parentKey: null | CandidateKey;
  vnode:
    | null
    | (ComponentPublicInstance & ItemState);
  level: number;
}

export type TreeviewFilterFn = (
  item: any,
  search: string,
  itemText: string,
) => boolean;
