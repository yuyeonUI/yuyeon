import {
  PropType,
  VNodeArrayChildren,
  computed,
  defineComponent,
  h,
  inject,
  ref,
} from 'vue';

import { useRender } from '../../composables/component';
import { getObjectValueByPath } from '../../util/common';
import { propsFactory } from '../../util/vue-component';
import { YButton } from '../button';
import { YPlate } from '../plate';

import { YIconCheckbox, YIconExpand } from '../icons';
import { YExpandVTransition } from '../transitions';

export const pressYTreeViewNodeProps = propsFactory(
  {
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
    disableTransition: Boolean,
    enableActive: Boolean,
    activeClass: [String, Array],
    activeColor: {
      type: String,
      default: 'primary',
    },
    enableSelect: Boolean,
  },
  'YTreeViewNode',
);

export const YTreeViewNode = defineComponent({
  name: 'YTreeNode',
  components: {
    YButton,
    YIconExpand,
    YPlate,
    YIconCheckbox,
  },
  props: {
    item: {
      type: Object as PropType<any>,
    },
    level: {
      type: Number as PropType<number>,
      default: 0,
    },
    ...pressYTreeViewNodeProps(),
  },
  setup(props, { slots, expose }) {
    const treeView = inject<any>('tree-view');

    const expanded = ref(false);
    const active = ref(false);
    const selected = ref(false);
    const immediate = ref(false);

    function onClick(e: MouseEvent) {
      const to = !active.value;
      active.value = to;
      treeView.updateActive(myKey.value, to);
      treeView.emitActive();
    }

    function onClickExpand(e: MouseEvent) {
      e.stopPropagation();
      const to = !expanded.value;
      expanded.value = to;
      treeView.updateExpanded(myKey.value, to);
      treeView.emitExpanded();
    }

    function onClickSelect(e: MouseEvent) {
      e.stopPropagation();
      const to = !selected.value;
      selected.value = to;
      treeView.updateSelected(myKey.value, to);
      treeView.emitSelected();
    }

    const children = computed(() => {
      return props.item?.[props.childrenKey] ?? [];
    });

    const imLeaf = computed(() => children.value.length < 1);

    const classes = computed(() => {
      return {
        'y-tree-view-node': true,
        'y-tree-view-node--leaf': imLeaf.value,
        'y-tree-view-node--expanded': expanded.value,
        'y-tree-view-node--active': active.value,
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
      };
    });

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
          h(
            'div',
            {
              class: 'y-tree-view-node__container',
              onClick: (e: MouseEvent) =>
                props.enableActive ? onClick(e) : void 0,
            },
            [
              h(YPlate),
              h('div', { class: 'y-tree-view-node__indents' }, indentSpacer),
              /* EXPAND */
              !imLeaf.value
                ? h(
                    YButton,
                    {
                      class: 'y-tree-view-node__expand-icon',
                      variation: 'icon',
                      onClick: (e: MouseEvent) => onClickExpand(e),
                    },
                    () => [
                      slots['expand-icon']
                        ? slots['expand-icon']()
                        : h(YIconExpand),
                    ],
                  )
                : h('i', { class: 'y-tree-view-node__no-expand-icon' }),
              props.enableSelect &&
                h(
                  'div',
                  {
                    class: ['y-tree-view-node__select'],
                    onClick: (e: MouseEvent) => onClickSelect(e),
                  },
                  [h(YIconCheckbox, { checked: selected.value })],
                ),
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
            ],
          ),
          /* CHILDREN */
          children.value.length > 0
            ? h(
                YExpandVTransition,
                { disabled: props.disableTransition },
                expanded.value
                  ? () =>
                      h(
                        'div',
                        {
                          class: { 'y-tree-view-node__leaves': true },
                          role: 'tree',
                        },
                        leaves,
                      )
                  : undefined,
              )
            : undefined,
        ],
      );
    });

    const myKey = computed(() => {
      return getObjectValueByPath(props.item, props.itemKey);
    });

    expose({
      myKey,
      expanded,
      active,
      selected,
      immediate,
    });

    return {
      treeView,
      myKey,
      expanded,
      active,
      selected,
      immediate,
    };
  },
  created() {
    this.treeView?.register?.(this.myKey, this);
  },
});

export type YTreeNode = InstanceType<typeof YTreeViewNode>;
