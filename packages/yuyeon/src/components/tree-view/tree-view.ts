import {
  type ComputedRef,
  computed,
  type InjectionKey,
  inject,
  provide,
  type Ref,
  ref,
  shallowRef,
} from 'vue';

import type { NodeState } from '@/components/tree-view/types';
import { useModelDuplex } from '@/composables';
import type { CandidateKey } from '@/types';
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
  isChildrenAll: (key: CandidateKey, stateKey: string, to: boolean) => boolean;
  isChildrenSome: (key: CandidateKey, stateKey: string) => boolean;
  selectedState: ComputedRef<
    (key: CandidateKey, children: CandidateKey[]) => { all: boolean; some: boolean }
  >;
}> = Symbol.for('YTreeView');

// TODO: props type
export function provideTreeView(props: any) {
  const nodes = ref<Record<CandidateKey, NodeState>>({});
  const expanded = useModelDuplex(props, 'expanded');
  const active = useModelDuplex(props, 'active');
  const selected = useModelDuplex(props, 'selected');

  const expandedSet = ref(new Set<CandidateKey>());
  const selectedSet = ref(new Set<CandidateKey>());
  const activeSet = ref(new Set<CandidateKey>());
  const searchLoading = shallowRef(false);
  const excludedSet = ref(new Set<CandidateKey>());

  const selectedState = computed(() => {
    let all = false;
    let some = false;

    return (key: CandidateKey, children: CandidateKey[]) => {
      all = children.every((child) => selectedSet.value.has(child));
      some = getDescendants(key).some((child) => selectedSet.value.has(child));
      return {
        all: all,
        some: some,
      };
    };
  });

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

    if (
      props.multipleActive &&
      (!props.onlyEventActiveStrategy ||
        (props.onlyEventActiveStrategy && event)) &&
      (props.activeStrategy === 'cascade' ||
        props.activeStrategy === 'relative')
    ) {
      for (const descendant of getDescendants(key)) {
        if (descendant in nodes.value) {
          setActive(descendant, to);
        }
      }
      if (props.activeStrategy === 'relative') {
        let grand: CandidateKey | null = node.parentKey;
        do {
          const parentKey = grand;
          grand = null;
          if (!parentKey) continue;
          const parent = nodes.value[parentKey];
          if (!parent) continue;
          const all = isChildrenAll(parentKey, 'active', to);
          if (all || !to) {
            setActive(parentKey, to);
            if (parent.parentKey) {
              grand = parent.parentKey;
            }
          }
        } while (grand != null);
      }
    }
  }

  function updateSelected(key: CandidateKey, to: boolean) {
    if (!(key in nodes.value)) return;
    const node = nodes.value[key];

    if (to) {
      if (props.selectStrategy !== 'leaf') {
        selectedSet.value.add(key);
      } else if (!node.childKeys.length) {
        selectedSet.value.add(key);
      }
      node.selected = true;
    }

    if (!to && key in nodes.value) {
      selectedSet.value.delete(key);
      nodes.value[key].selected = false;
      issueVnodeState(key);
    }

    if (
      props.selectStrategy === 'cascade' ||
      props.selectStrategy === 'relative' ||
      props.selectStrategy === 'leaf'
    ) {
      for (const descendant of getDescendants(key)) {
        if (descendant in nodes.value) {
          if (props.selectStrategy === 'leaf' && !!nodes.value[descendant]?.childKeys?.length) {
            continue;
          }
          setSelected(descendant, to);
        }
      }
      if (props.selectStrategy === 'relative') {
        let grand: CandidateKey | null = node.parentKey;
        do {
          const parentKey = grand;
          grand = null;
          if (!parentKey) continue;
          const parent = nodes.value[parentKey];
          if (!parent) continue;
          const all = isChildrenAll(parentKey, 'selected', to);
          if (all || !to) {
            setSelected(parentKey, to);
            if (parent.parentKey) {
              grand = parent.parentKey;
            }
          }
        } while (grand != null);
      }
    }
  }

  function isChildrenAll(key: CandidateKey, stateKey: string, to: boolean) {
    const node = nodes.value[key];
    if (!node) return false;
    const { childKeys } = node;
    return childKeys.every((childKey) => {
      return (nodes.value[childKey] as any)?.[stateKey] === to;
    });
  }

  function isChildrenSome(key: CandidateKey, stateKey: string) {
    const node = nodes.value[key];
    if (!node) return false;
    const { childKeys } = node;
    return childKeys.some((childKey) => {
      return (nodes.value[childKey] as any)?.[stateKey] === true;
    });
  }

  function setActive(key: CandidateKey, to: boolean) {
    to ? activeSet.value.add(key) : activeSet.value.delete(key);
    nodes.value[key].active = to;
    issueVnodeState(key);
  }

  function setSelected(key: CandidateKey, to: boolean) {
    to ? selectedSet.value.add(key) : selectedSet.value.delete(key);
    nodes.value[key].selected = to;
    issueVnodeState(key);
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
    isChildrenAll,
    isChildrenSome,
    selectedState,
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
    selectedState,
  };
}

export function useTreeView() {
  const instance = inject(Y_TREE_VIEW);
  if (!instance) throw new Error('Not found provided YTreeView');
  return instance;
}
