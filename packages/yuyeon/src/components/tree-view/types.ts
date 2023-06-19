import { ComponentPublicInstance } from "vue";

export type NodeKey = string | number;

export interface NodeState {
  childKeys: NodeKey[];
  item: any;
  parentKey: null | NodeKey;
  vnode: null | ComponentPublicInstance;
  //
  selected: false,
  indeterminate: false,
  active: false,
  expanded: false,
}
