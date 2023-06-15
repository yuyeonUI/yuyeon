import {
  PropType,
  VNodeArrayChildren,
  computed,
  defineComponent,
  h,
  inject,
} from 'vue';

import { useRender } from '../../composables/component';
import { getObjectValueByPath } from '../../util/common';
import { YIconExpand } from '../icons';

export const YTreeViewNode = defineComponent({
  name: 'YTreeNode',
  props: {
    item: {
      type: Object as PropType<any>,
    },
    itemKey: {
      type: String as PropType<string>,
      default: 'id',
    },
    textKey: {
      type: String as PropType<string>,
      default: 'text',
    },
    childrenKey: {
      type: String as PropType<string>,
      default: 'children',
    },
    level: {
      type: Number as PropType<number>,
      default: 0,
    },
  },
  setup(props, { slots }) {
    const treeView = inject<any>('tree-view');

    const children = computed(() => {
      return props.item?.[props.childrenKey] ?? [];
    });

    const imLeaf = computed(() => children.value.length < 1);

    const classes = computed(() => {
      return {
        'y-tree-view-node': true,
        'y-tree-view-node--leaf': imLeaf.value,
      };
    });

    const styles = computed(() => {
      return {
        '--tree-view-node--level': props.level,
      };
    });

    const contentText = computed(() => {
      return getObjectValueByPath(props.item, props.textKey) ?? '';
    });

    const slotProps = computed(() => {
      return {
        level: props.level,
        imLeaf: imLeaf.value,
      }
    })

    useRender(() => {
      const leaves = children.value.map((item: any) => {
        return h(
          YTreeViewNode,
          { ...props, level: (props.level ?? 0) + 1, item },
          slots,
        );
      });
      const indentSpacer: VNodeArrayChildren = [];
      for (let i = 0; i < props.level; i += 1) {
        indentSpacer.push(
          h('div', { class: 'y-tree-view-node__indent-spacer' }),
        );
      }
      return h(
        'div',
        {
          class: classes.value,
          style: styles.value,
          '.role': 'treeitem',
          'data-level': props.level,
        },
        [
          h('div', { class: 'y-tree-view-node__container' }, [
            h('div', { class: 'y-tree-view-node__indents' }, indentSpacer),
            /* EXPAND */
            !imLeaf.value
              ? h('i', { class: 'y-tree-view-node__expand-icon' }, [
                  slots['expand-icon']
                    ? slots['expand-icon']()
                    : h(YIconExpand, {
                        style: { width: '12px', height: '12px' },
                      }),
                ])
              : h('i', { class: 'y-tree-view-node__no-expand-icon' }),
            /* CONTENT */
            h('div', { class: 'y-tree-view-node__content' }, [
              slots.leading &&
                h(
                  'div',
                  { class: 'y-tree-view-node__leading' },
                  slots.leading(slotProps.value),
                ),
              h(
                'div',
                { class: 'y-tree-view-node__text' },
                slots.default
                  ? slots.default?.({
                      text: contentText.value,
                      item: props.item,
                    })
                  : contentText.value,
              ),
              slots.trailing &&
              h(
                'div',
                { class: 'y-tree-view-node__trailing' },
                slots.trailing(),
              ),
            ]),
          ]),
          /* CHILDREN */
          children.value.length > 0
            ? h(
                'div',
                { class: { 'y-tree-view-node__leaves': true }, role: 'tree' },
                leaves,
              )
            : undefined,
        ],
      );
    });

    const myKey = computed(() => {
      return getObjectValueByPath(props.item, props.itemKey);
    });

    return {
      treeView,
      myKey,
    };
  },
  created() {
    this.treeView?.register?.(this.myKey, this);
  },
});

export type YTreeNode = InstanceType<typeof YTreeViewNode>;
