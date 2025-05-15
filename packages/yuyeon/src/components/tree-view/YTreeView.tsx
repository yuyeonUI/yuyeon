import {
  type PropType,
  type Ref,
  computed,
  defineComponent,
  onMounted,
  ref,
  shallowRef,
  watch,
} from 'vue';

import { provideTreeView } from '@/components/tree-view/tree-view';
import { useRender } from '@/composables/component';
import { CandidateKey } from '@/types';
import { differenceBetween } from '@/util/array';
import { isColorValue } from '@/util/color';
import { deepEqual, getObjectValueByPath, hasOwnProperty } from '@/util/common';
import { chooseProps } from '@/util/component';
import { debounce } from '@/util/debounce';

import { YProgressBar } from '../progress-bar';
import { YTreeViewNode, pressYTreeViewNodeProps } from './YTreeViewNode';
import { NodeState, TreeviewFilterFn } from './types';
import { filterTreeItem, filterTreeItems, getKeys } from './util';

import './YTreeView.scss';

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
      type: String as PropType<'independent' | 'cascade' | 'relative'>,
      default: 'independent',
    },
    selected: {
      type: [Array] as PropType<CandidateKey[]>,
      default: () => [],
    },
    selectStrategy: {
      type: String as PropType<'independent' | 'cascade'>,
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
    const filterItemsFn = shallowRef(
      debounce(excludeItem, props.searchDebounceWait),
    );
    const expandedCache = ref<CandidateKey[]>([]);

    const {
      nodes,
      expanded,
      active,
      selected,
      expandedSet,
      selectedSet,
      activeSet,
      searchLoading,
      excludedSet,
      issueVnodeState,
      updateExpanded,
      updateActive,
      updateSelected,
      emitExpanded,
      emitActive,
      emitSelected,
      isExcluded,
    } = provideTreeView(props);

    function excludeItem(items: any[], search = '', filter = filterTreeItem) {
      const excluded = new Set<CandidateKey>();
      if (!search) {
        searchLoading.value = false;
        excludedSet.value = excluded;
        const diff = differenceBetween(expandedCache.value, [
          ...expandedSet.value,
        ]);
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

    watch(
      () => props.search,
      () => {
        searchLoading.value = true;
        filterItemsFn.value(props.items, props.search, props.filter);
      },
    );

    // Util Methods
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
        const children =
          getObjectValueByPath(item, props.itemChildren as string) ?? [];
        const exist = hasOwnProperty(nodes.value, key);
        const existNode = exist
          ? nodes.value[key]
          : {
              vnode: null,
              selected: selected.value?.includes(key) ?? false,
              indeterminate: false,
              active: active.value?.includes(key) ?? false,
              expanded: expanded.value?.includes(key) ?? false,
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
          selectedSet.value.add(key);
        }
        if (nodes.value[key].active) {
          activeSet.value.add(key);
        }
        issueVnodeState(key);
      }
    }

    watch(
      expandedSet,
      (neo) => {
        if (!props.search) {
          expandedCache.value = [...neo];
        }
      },
      { deep: true },
    );

    function expand(until: boolean | string | number = true) {
      Object.entries(nodes.value).forEach(([key, node]) => {
        if (until === true || Number(until) >= node.level) {
          updateExpanded(key, true);
        }
      });
      emitExpanded();
      return expandedSet.value;
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
        const neoKeys = getKeys(
          neo,
          props.itemKey,
          props.itemChildren as string,
        );
        const diff = differenceBetween(oldKeys, neoKeys);
        if (diff.length < 1 && neoKeys.length < oldKeys.length) {
          return;
        }
        diff.forEach((k) => delete nodes.value[k]);

        // init
        const oldSelected = [...selectedSet.value];
        const oldActive = [...activeSet.value];
        selectedSet.value.clear();
        expandedSet.value.clear();
        activeSet.value.clear();
        updateNodes(neo);
        if (!deepEqual(oldSelected, [...selectedSet.value])) {
          emitSelected();
        }
        if (!deepEqual(oldActive, [...activeSet.value])) {
          emitActive();
        }
        filterItemsFn.value(neo, props.search, props.filter);
      },
      { deep: true, flush: 'sync' },
    );

    // Provide & Issue

    updateNodes(props.items);

    const renderLeaves = computed(() => {
      return props.items.slice().filter((leaf) => {
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
        color = `var(--y-theme-${props.activeColor})`;
      }
      return {
        [`--y-tree-view__active-color`]: color,
      };
    });

    onMounted(() => {
      if (props.search) {
        searchLoading.value = true;
        excludeItem(props.items, props.search, props.filter);
      }

      if (props.defaultExpand != null && props.defaultExpand !== false) {
        expandedCache.value = [...expand(props.defaultExpand)];
      } else {
        expanded.value.forEach((v: any) => updateExpanded(getNodeKey(v), true));
        emitExpanded();
      }

      for (const activeValue of props.active.map(getNodeKey)) {
        updateActive(activeValue, true);
      }

      for (const selectedValue of props.selected.map(getNodeKey)) {
        updateSelected(selectedValue, true);
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
              renderLeaves.value.slice().map((leaf) => {
                return (
                  <YTreeViewNode
                    v-slots={slots}
                    key={getObjectValueByPath(leaf, props.itemKey)}
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
      renderLeaves,
    };
  },
});

export type YTreeView = InstanceType<typeof YTreeView>;
