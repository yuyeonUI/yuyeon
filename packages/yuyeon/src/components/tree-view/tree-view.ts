import {
  InjectionKey,
  Ref,
  inject,
  provide,
  ref,
  shallowRef,
} from 'vue';

import { useModelDuplex } from '@/composables';
import { CandidateKey } from '@/types';
import { getObjectValueByPath } from '@/util';

export const Y_TREE_VIEW: InjectionKey<{
  register: (key: CandidateKey, vnode: any) => void;
  updateExpanded: (key: CandidateKey, to: boolean) => void;
  updateActive: (key: CandidateKey, to: boolean, event?: MouseEvent) => void;
  updateSelected: (key: CandidateKey, to: boolean) => void;
  searchLoading: Ref<boolean>;
  isExcluded: (key: CandidateKey) => boolean;
  emitExpanded: () => void;
  emitActive: () => void;
  emitSelected: () => void;
}> = Symbol.for('YTreeView');

// TODO: props type
export function provideTreeView(props: any) {
  const nodes = ref<Record<CandidateKey, any>>({});
  const expanded = useModelDuplex(props, 'expanded');
  const active = useModelDuplex(props, 'active');
  const selected = useModelDuplex(props, 'selected');

  const expandedSet = ref(new Set<CandidateKey>());
  const selectedSet = ref(new Set<CandidateKey>());
  const activeSet = ref(new Set<CandidateKey>());
  const searchLoading = shallowRef(false);
  const excludedSet = ref(new Set<CandidateKey>());

  // Utils
  function getDescendants(key: CandidateKey) {
    const descendants: CandidateKey[] = [];
    const { childKeys } = nodes.value[key];
    descendants.push(...childKeys);
    const remains: CandidateKey[] = childKeys.slice();

    while (remains.length > 0) {
      const childKey: CandidateKey = remains.splice(0, 1)[0];
      const item = nodes.value[childKey];
      if (item) {
        descendants.push(...item.childKeys);
        remains.push(...item.childKeys);
      }
    }

    return descendants;
  }

  // Search
  function isExcluded(key: CandidateKey) {
    return !!props.search && excludedSet.value.has(key);
  }

  //
  function issueVnodeState(key: CandidateKey) {
    const node = nodes.value[key];
    if (node?.vnode) {
      node.vnode.active = node.active;
      node.vnode.selected = node.selected;
      node.vnode.indeterminate = node.indeterminate;
      node.vnode.expanded = node.expanded;
    }
  }

  // Update
  function updateExpanded(key: CandidateKey, to: boolean) {
    if (!(key in nodes.value)) return;
    const node = nodes.value[key];
    const children = getObjectValueByPath(
      node.item,
      props.itemChildren as string,
    );
    if (Array.isArray(children) && children.length > 0) {
      to ? expandedSet.value.add(key) : expandedSet.value.delete(key);
      node.expanded = to;
      issueVnodeState(key);
    }
  }

  function updateActive(key: CandidateKey, to: boolean, event?: MouseEvent) {
    if (!(key in nodes.value)) return;
    const node = nodes.value[key];
    let inactiveKey = !to ? key : '';
    if (!props.multipleActive && to && !activeSet.value.has(key)) {
      [inactiveKey] = [...activeSet.value];
    }
    if (to) {
      activeSet.value.add(key);
      node.active = true;
      issueVnodeState(key);
    } else {
      if (
        props.requiredActive &&
        activeSet.value.size === 1 &&
        key === inactiveKey
      ) {
        issueVnodeState(key);
        return;
      }
    }
    if (inactiveKey && inactiveKey in nodes.value) {
      activeSet.value.delete(inactiveKey);
      nodes.value[inactiveKey].active = false;
      issueVnodeState(inactiveKey);
    }

    if (
      props.activeSingleModifier &&
      event?.getModifierState(props.activeSingleModifier)
    ) {
      return;
    }

    if (props.multipleActive && props.activeStrategy === 'cascade') {
      for (const descendant of getDescendants(key)) {
        if (descendant in nodes.value) {
          to
            ? activeSet.value.add(descendant)
            : activeSet.value.delete(descendant);
          nodes.value[descendant].active = to;
          issueVnodeState(descendant);
        }
      }
    }
  }

  function updateSelected(key: CandidateKey, to: boolean) {
    if (!(key in nodes.value)) return;
    const node = nodes.value[key];

    if (to) {
      selectedSet.value.add(key);
      node.selected = true;
    }

    if (!to && key in nodes.value) {
      selectedSet.value.delete(key);
      nodes.value[key].selected = false;
      issueVnodeState(key);
    }

    if (props.selectStrategy === 'cascade') {
      for (const descendant of getDescendants(key)) {
        if (descendant in nodes.value) {
          to
            ? selectedSet.value.add(descendant)
            : selectedSet.value.delete(descendant);
          nodes.value[descendant].selected = to;
          issueVnodeState(descendant);
        }
      }
    }
  }

  // Emit
  function emitExpanded() {
    const arr = [...expandedSet.value];
    expanded.value = props.returnItem
      ? arr.map((key) => nodes.value[key].item)
      : arr;
  }

  function emitActive() {
    const arr = [...activeSet.value];
    active.value = props.returnItem
      ? arr.map((key) => nodes.value[key].item)
      : arr;
  }

  function emitSelected() {
    const arr = [...selectedSet.value];
    selected.value = props.returnItem
      ? arr.map((key) => nodes.value[key].item)
      : arr;
  }

  // Inject
  function register(key: CandidateKey, vnode: any) {
    if (nodes.value[key]) {
      nodes.value[key].vnode = vnode;
    }

    issueVnodeState(key);
  }

  provide(Y_TREE_VIEW, {
    register,
    updateExpanded,
    updateActive,
    updateSelected,
    searchLoading,
    isExcluded,
    emitExpanded,
    emitActive,
    emitSelected,
  });

  return {
    nodes,
    expanded,
    active,
    selected,
    issueVnodeState,
    updateExpanded,
    updateActive,
    updateSelected,
    emitExpanded,
    emitActive,
    emitSelected,
    expandedSet,
    selectedSet,
    activeSet,
    searchLoading,
    excludedSet,
    isExcluded,
  };
}

export function useTreeView() {
  const instance = inject(Y_TREE_VIEW);
  if (!instance) throw new Error('Not found provided YTreeView');
  return instance;
}
