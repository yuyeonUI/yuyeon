import {
  PropType,
  Ref,
  VNode,
  computed,
  defineComponent,
  onMounted,
  provide,
  ref,
  shallowRef,
  watch,
  watchEffect,
} from 'vue';

import { useModelDuplex } from '../../composables/communication';
import { useRender } from '../../composables/component';
import { differenceBetween } from '../../util/array';
import {
  deepEqual,
  getObjectValueByPath,
  hasOwnProperty,
} from '../../util/common';
import { debounce } from '../../util/debounce';
import { chooseProps } from '../../util/vue-component';
import { YProgressBar } from '../progress-bar';
import { YTreeViewNode, pressYTreeViewNodeProps } from './YTreeViewNode';
import { filterTreeItem, filterTreeItems, getKeys } from './util';

import { CandidateKey } from '../../types';
import './YTreeView.scss';
import { NodeState, TreeviewFilterFn } from './types';
import { isColorValue } from "../../util/color";

const treeViewNodeProps = pressYTreeViewNodeProps();

export const YTreeView = defineComponent({
  name: 'YTreeView',
  props: {
    expanded: {
      type: [Array] as PropType<CandidateKey[]>,
      default: () => [],
    },
    active: {
      type: [Array] as PropType<CandidateKey[]>,
      default: () => [],
    },
    multipleActive: Boolean,
    activeStrategy: {
      type: String as PropType<'independent' | 'cascade'>, // TODO: 'leaf'
      default: 'independent',
    },
    selected: {
      type: [Array] as PropType<CandidateKey[]>,
      default: () => [],
    },
    selectStrategy: {
      type: String as PropType<'independent' | 'cascade'>, // TODO: 'leaf'
      default: 'leaf',
    },
    returnItem: Boolean,
    defaultExpand: [Boolean, String, Number],
    filter: Function as PropType<TreeviewFilterFn>,
    searchDebounceWait: {
      type: Number as PropType<number>,
      default: 700,
    },
    ...treeViewNodeProps,
  },
  emits: ['update:expanded', 'update:active', 'update:selected'],
  setup(props, { slots, emit, expose }) {
    const nodes = ref<Record<CandidateKey, any>>({});

    const expanded = useModelDuplex(props, 'expanded');
    const active = useModelDuplex(props, 'active');
    const selected = useModelDuplex(props, 'selected');

    const expandedSet = ref(new Set<CandidateKey>());
    const selectedSet = ref(new Set<CandidateKey>());
    const activeSet = ref(new Set<CandidateKey>());
    const excludedSet = ref(new Set<CandidateKey>());
    const filterItemsFn = shallowRef(
      debounce(excludeItem, props.searchDebounceWait),
    );
    const expandedCache = ref<CandidateKey[]>([]);
    const searchLoading = shallowRef(false);

    function excludeItem(items: any[], search = '', filter = filterTreeItem) {
      const excluded = new Set<CandidateKey>();
      if (!search) {
        searchLoading.value = false;
        excludedSet.value = excluded;
        const diff = differenceBetween(expandedCache.value, [...expandedSet.value]);
        diff.forEach((key) => {
          updateExpanded(key, false);
        });
        expandedCache.value.forEach((key) => {
          updateExpanded(key, true);
        });
        return;
      }
      for (const item of items) {
        filterTreeItems(
          filter,
          item,
          search ?? '',
          props.itemKey,
          props.itemText,
          props.itemChildren as string,
          excluded,
        );
      }
      excludedSet.value = excluded;
      searchLoading.value = false;
      expand();
    }

    watchEffect(() => {
      searchLoading.value = true;
      filterItemsFn.value(props.items, props.search, props.filter);
    });

    // Util Methods
    function getDescendants(
      key: CandidateKey,
      descendants: CandidateKey[] = [],
    ) {
      const { childKeys } = nodes.value[key];
      descendants.push(...childKeys);
      for (const childKey of childKeys) {
        descendants = getDescendants(childKey, descendants);
      }
      return descendants;
    }

    function getNodeKey(itemOrKey: any) {
      return props.returnItem
        ? getObjectValueByPath(itemOrKey, props.itemKey)
        : itemOrKey;
    }

    // State Methods
    function updateNodes(
      items: any[],
      parentKey: CandidateKey | null = null,
      level = 0,
    ) {
      for (const item of items) {
        const key = getObjectValueByPath(item, props.itemKey);
        const children = getObjectValueByPath(item, props.itemChildren as string) ?? [];
        const exist = hasOwnProperty(nodes.value, key);
        const existNode = exist
          ? nodes.value[key]
          : {
              vnode: null,
              selected: false,
              indeterminate: false,
              active: false,
              expanded: false,
            };
        const node: NodeState = {
          vnode: existNode.vnode,
          item,
          level,
          parentKey,
          childKeys: children.map((child: any) =>
            getObjectValueByPath(child, props.itemKey),
          ),
          expanded: children.length > 0 && existNode.expanded,
          active: existNode.active,
          indeterminate: existNode.indeterminate,
          selected: existNode.selected,
        };

        updateNodes(children, key, level + 1);

        nodes.value[key] = node;
        if (nodes.value[key].expanded) {
          expandedSet.value.add(key);
        }
        if (nodes.value[key].selected) {
          expandedSet.value.add(key);
        }
        if (nodes.value[key].active) {
          activeSet.value.add(key);
        }

        issueVnodeState(key);
      }
    }

    function updateExpanded(key: CandidateKey, to: boolean) {
      if (!(key in nodes.value)) return;
      const node = nodes.value[key];
      const children = getObjectValueByPath(node.item, props.itemChildren as string);
      if (Array.isArray(children) && children.length > 0) {
        to ? expandedSet.value.add(key) : expandedSet.value.delete(key);
        node.expanded = to;
        issueVnodeState(key);
      }
    }

    watch(expandedSet, (neo) => {
      if (!props.search) {
        expandedCache.value = [...neo];
      }
    }, { deep: true })

    function expand(until: boolean | string | number = true) {
      Object.entries(nodes.value).forEach(([key, node]) => {
        if (until === true || until >= node.level) {
          updateExpanded(key, true);
        }
      });
      emitExpanded();
      return expandedSet.value;
    }

    function updateActive(key: CandidateKey, to: boolean, event?: MouseEvent) {
      if (!(key in nodes.value)) return;
      const node = nodes.value[key];
      let inactiveKey = !to ? key : '';
      if (!props.multipleActive) {
        [inactiveKey] = activeSet.value.keys();
      }
      if (to) {
        activeSet.value.add(key);
        node.active = true;
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

    function stateWatcher(
      value: any[],
      stateSet: Ref<Set<CandidateKey>>,
      updater: (key: CandidateKey, to: boolean) => void,
      emitter: () => void,
    ) {
      const valuesOfKey = props.returnItem
        ? value.map((v) => getObjectValueByPath(v, props.itemKey))
        : value;
      const old = [...stateSet.value];
      if (deepEqual(old, valuesOfKey)) {
        return;
      }
      old.forEach((key) => updater(key, false));
      valuesOfKey.forEach((key) => updater(key, true));
      emitter();
    }

    watch(expanded, (neo) => {
      stateWatcher(neo, expandedSet, updateExpanded, emitExpanded);
    });

    watch(active, (neo) => {
      stateWatcher(neo, activeSet, updateActive, emitActive);
    });

    watch(selected, (neo) => {
      stateWatcher(neo, selectedSet, updateSelected, emitSelected);
    });

    watch(
      () => props.items,
      (neo: any[]) => {
        const oldKeys = Object.keys(nodes.value).map((nodeKey) =>
          getObjectValueByPath(nodes.value[nodeKey].item, props.itemKey),
        );
        const neoKeys = getKeys(neo, props.itemKey, props.itemChildren as string);
        const diff = differenceBetween(oldKeys, neoKeys);
        if (diff.length < 1 && neoKeys.length < oldKeys.length) {
          return;
        }
        diff.forEach((k) => delete nodes.value[k]);

        // init
        const oldSelected = [...selectedSet.value];
        selectedSet.value.clear();
        expandedSet.value.clear();
        activeSet.value.clear();
        updateNodes(neo);
        if (!deepEqual(oldSelected, [...selectedSet.value])) {
          emitSelected();
        }
      },
      { deep: true },
    );

    // Search
    function isExcluded(key: CandidateKey) {
      return !!props.search && excludedSet.value.has(key);
    }

    // Provide & Issue
    function issueVnodeState(key: CandidateKey) {
      const node = nodes.value[key];
      if (node && node.vnode) {
        node.vnode.active = node.active;
        node.vnode.selected = node.selected;
        node.vnode.indeterminate = node.indeterminate;
        node.vnode.expanded = node.expanded;
      }
    }

    function register(key: CandidateKey, vnode: VNode) {
      if (nodes.value[key]) {
        nodes.value[key].vnode = vnode;
      }

      issueVnodeState(key);
    }

    updateNodes(props.items);

    for (const activeValue of props.active.map(getNodeKey)) {
      updateActive(activeValue, true);
    }

    for (const selectedValue of props.selected.map(getNodeKey)) {
      updateSelected(selectedValue, true);
    }

    provide('tree-view', {
      register,
      updateExpanded,
      updateActive,
      updateSelected,
      emitExpanded,
      emitActive,
      emitSelected,
      isExcluded,
      searchLoading,
    });

    const renderLeaves = computed(() => {
      return props.items.filter((leaf) => {
        return !isExcluded(getObjectValueByPath(leaf, props.itemKey));
      });
    });

    const classes = computed(() => {
      return {
        'y-tree-view': true,
      };
    });

    const styles = computed(() => {
      let color = props.activeColor;
      if (props.activeColor && !isColorValue(props.activeColor)) {
        color = `rgba(var(--y-theme-${props.activeColor}), 1)`;
      }
      return {
        [`--y-tree-view__active-color`]: color,
      };
    });

    onMounted(() => {
      if (props.defaultExpand !== undefined) {
        expandedCache.value = [...expand(props.defaultExpand)];
      } else {
        expanded.value.forEach((v: any) => updateExpanded(getNodeKey(v), true));
        emitExpanded();
      }
    });

    expose({
      expand,
    });

    useRender(() => {
      return (
        <>
          <div class={classes.value} style={styles.value} role="tree">
            {searchLoading.value && <YProgressBar indeterminate />}
            {renderLeaves.value.length > 0 ? (
              renderLeaves.value.map((leaf) => {
                return (
                  <YTreeViewNode
                    v-slots={slots}
                    {...{
                      ...chooseProps(props, treeViewNodeProps),
                      item: leaf,
                      level: 0,
                    }}
                  ></YTreeViewNode>
                );
              })
            ) : (
              <div class="y-tree-view__no-data">
                {slots['no-data'] ? slots['no-data']() : <span>No Data</span>}
              </div>
            )}
          </div>
        </>
      );
    });

    return {
      nodes,
      expandedSet,
      selectedSet,
      activeSet,
      excludedSet,
      searchLoading,
      expandedCache,
    };
  },
});

export type YTreeView = InstanceType<typeof YTreeView>;
