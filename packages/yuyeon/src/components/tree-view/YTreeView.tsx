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
import { getObjectValueByPath, hasOwnProperty } from '../../util/common';
import { YTreeViewNode } from './YTreeViewNode';

import './YTreeView.scss';

type NodeKey = string | number;

export const YTreeView = defineComponent({
  name: 'YTreeView',
  props: {
    items: {
      type: Array as PropType<any[]>,
      default: () => [],
    },
    itemKey: {
      type: String as PropType<string>,
      default: 'id',
    },
    childrenKey: {
      type: String as PropType<string>,
      default: 'children',
    },
  },
  setup(props, { slots }) {
    const classes = computed(() => {
      return {
        'y-tree-view': true,
      };
    });

    const nodes = ref<Record<NodeKey, any>>({});

    const expanded = ref<string[]>([]);

    function updateNodes(items: any[], parentKey: NodeKey | null = null) {
      for (const item of items) {
        const key = getObjectValueByPath(item, props.itemKey);
        const children = getObjectValueByPath(item, props.childrenKey) ?? [];
        const exist = hasOwnProperty(nodes.value, key);
        const oldNode = exist
          ? nodes.value[key]
          : {
              selected: false,
              indeterminate: false,
              active: false,
              opened: false,
              vnode: null,
            };
        const node = {
          vnode: oldNode.vnode,
          item,
          parentKey,
          childKeys: children.map((child: any) =>
            getObjectValueByPath(child, props.itemKey),
          ),
        };

        updateNodes(children, key);

        nodes.value[key] = node;
      }
    }

    updateNodes(props.items);
    watch(
      () => props.items,
      (neo: any[]) => {
        updateNodes(neo);
      },
      { deep: true },
    );

    function register(key: string | number, vnode: VNode) {
      if (nodes.value[key]) {
        nodes.value[key].vnode = vnode;
      }
    }

    provide('tree-view', { register });

    const renderLeaves = computed(() => {
      return props.items;
    });

    useRender(() => {
      return (
        <>
          <div class={classes.value} role="tree">
            {renderLeaves.value.length > 0 ? (
              renderLeaves.value.map((leaf) => {
                return (
                  <YTreeViewNode item={leaf} level={0} v-slots={slots}>
                  </YTreeViewNode>
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
    };
  },
});

export type YTreeView = InstanceType<typeof YTreeView>;
