import {
  PropType,
  VNode,
  computed,
  defineComponent,
  provide,
  ref,
  watch,
} from 'vue';

import { useRender } from '../../composables/component';
import { diffrenceBetween } from '../../util/array';
import { getObjectValueByPath, hasOwnProperty } from '../../util/common';
import { isColorValue } from '../../util/ui';
import { YTreeViewNode, pressYTreeViewNodeProps } from './YTreeViewNode';
import { getKeys } from './util';

import './YTreeView.scss';
import { NodeKey, NodeState } from './types';

const treeViewNodeProps = pressYTreeViewNodeProps();

export const YTreeView = defineComponent({
  name: 'YTreeView',
  props: {
    items: {
      type: Array as PropType<any[]>,
      default: () => [],
    },
    active: {
      type: [Array] as PropType<NodeKey[]>,
      default: () => [],
    },
    expand: {
      type: [Array] as PropType<NodeKey[]>,
      default: () => [],
    },
    select: {
      type: [Array] as PropType<NodeKey[]>,
      default: () => [],
    },
    ...treeViewNodeProps,
  },
  setup(props, { slots }) {
    const nodes = ref<Record<NodeKey, any>>({});

    const expanded = ref(new Set<number | string>());
    const selected = ref(new Set<number | string>());
    const active = ref(new Set<number | string>());

    const expandedCache = ref<string[]>([]);

    function updateNodes(items: any[], parentKey: NodeKey | null = null) {
      for (const item of items) {
        const key = getObjectValueByPath(item, props.itemKey);
        const children = getObjectValueByPath(item, props.childrenKey) ?? [];
        const exist = hasOwnProperty(nodes.value, key);
        const existNode = exist
          ? nodes.value[key]
          : {
              selected: false,
              indeterminate: false,
              active: false,
              expanded: false,
              vnode: null,
            };
        const node: NodeState = {
          vnode: existNode.vnode,
          item,
          parentKey,
          childKeys: children.map((child: any) =>
            getObjectValueByPath(child, props.itemKey),
          ),
          expanded: children.length > 0 && existNode.expanded,
          active: existNode.active,
          indeterminate: existNode.indeterminate,
          selected: existNode.selected,
        };

        updateNodes(children, key);

        nodes.value[key] = node;
      }
    }

    updateNodes(props.items);
    watch(
      () => props.items,
      (neo: any[]) => {
        const oldKeys = Object.keys(nodes.value).map((nodeKey) =>
          getObjectValueByPath(nodes.value[nodeKey].item, props.itemKey),
        );
        const neoKeys = getKeys(neo, props.itemKey, props.childrenKey);
        const diff = diffrenceBetween(oldKeys, neoKeys);
        if (diff.length < 1 && neoKeys.length < oldKeys.length) {
          return;
        }
        diff.forEach((k) => delete nodes.value[k]);

        updateNodes(neo);
      },
      { deep: true },
    );

    function issueVnodeState(key: NodeKey) {
      const node = nodes.value[key];
      if (node && node.vnode) {
        node.vnode.active = node.active;
      }
    }

    function register(key: NodeKey, vnode: VNode) {
      if (nodes.value[key]) {
        nodes.value[key].vnode = vnode;
      }

      issueVnodeState(key);
    }

    function updateExpand(key: NodeKey, to: boolean) {
      if (!(key in nodes.value)) return;
      const node = nodes.value[key];
      console.log(node);
      if (to) {
        expanded.value.add(key);
      } else {
        expanded.value.delete(key);
      }
    }

    function updateActive(key: NodeKey, to: boolean) {
      if (!(key in nodes.value)) return;
      const node = nodes.value[key];
      if (to) {
        active.value.add(key);
        node.active = true;
      } else {
        active.value.delete(key);
        node.active = false;
      }
    }

    provide('tree-view', { register, updateExpand, updateActive });

    const renderLeaves = computed(() => {
      return props.items;
    });

    const classes = computed(() => {
      return {
        'y-tree-view': true,
      };
    });

    const styles = computed(() => {
      let color = props.activeColor;
      if (props.activeColor && !isColorValue(props.activeColor)) {
        color = `rgba(var(--y-theme--${props.activeColor}), 1)`;
      }
      return {
        [`--y-tree-view__active-color`]: color,
      };
    });

    useRender(() => {
      return (
        <>
          <div class={classes.value} style={styles.value} role="tree">
            {renderLeaves.value.length > 0 ? (
              renderLeaves.value.map((leaf) => {
                return (
                  <YTreeViewNode
                    item={leaf}
                    level={0}
                    v-slots={slots}
                    disableTransition={props.disableTransition}
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
      expanded,
    };
  },
});

export type YTreeView = InstanceType<typeof YTreeView>;
