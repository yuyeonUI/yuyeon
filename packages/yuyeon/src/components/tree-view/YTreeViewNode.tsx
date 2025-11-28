/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/a11y/useFocusableInteractive: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
import {
  computed,
  mergeProps,
  onBeforeMount,
  type PropType,
  ref,
  resolveComponent,
  type SlotsType,
  type VNodeArrayChildren,
  watch,
} from 'vue';

import { pressItemsPropsOptions } from '@/abstract/items';
import { useTreeView } from '@/components/tree-view/tree-view';
import { useRender } from '@/composables/component';
import { getObjectValueByPath, getPropertyFromItem } from '@/util/common';
import { defineComponent, propsFactory } from '@/util/component';

import { YButton } from '../button';
import { YIconCheckbox, YIconExpand } from '../icons';
import { YPlate } from '../plate';
import { YTextHighlighter } from '../text-highlighter/YTextHighlighter';
import { YExpandVTransition } from '../transitions';

export const pressYTreeViewNodeProps = propsFactory(
  {
    search: String,
    disableTransition: Boolean,
    enableActive: Boolean,
    activeStrategy: {
      /**
       * cascade: only action descendent leaves
       * relative: cascade after check parent (ancestor)
       */
      type: String as PropType<'independent' | 'cascade' | 'relative'>,
      default: 'independent',
    },
    activeClass: [String, Array],
    activeSingleModifier: String,
    requiredActive: Boolean,
    activeColor: {
      type: String,
      default: 'primary',
    },
    enableSelect: Boolean,
    selectStrategy: {
      /**
       * cascade: only action descendent leaves
       * relative: cascade after check parent (ancestor)
       * leaves: relative after return values only leaf
       */
      type: String as PropType<'independent' | 'cascade' | 'relative' | 'leaf'>,
      default: 'relative',
    },
    onMouseenterContainer: Function,
    onMouseleaveContainer: Function,
    onMousemoveContainer: Function,
    itemSelectable: {
      type: [String, Array, Function] as PropType<any>,
    },
    ...pressItemsPropsOptions({
      itemKey: 'id',
    }),
  },
  'YTreeViewNode',
);

/**
 * TODO: correct selected values what selectStrategy leaf or others
 */
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
  slots: Object as SlotsType<{
    default: any;
    'expand-icon': any;
    leading: any;
    trailing: any;
  }>,
  setup(props, { slots, expose }) {
    const YTreeNode = resolveComponent('YTreeViewNode', true) as any;
    const treeView = useTreeView();
    const container$ = ref<HTMLElement>();

    const expanded = ref(false);
    const active = ref(false);
    const selected = ref(false);
    const indeterminate = ref(false);

    const myKey = computed(() =>
      getObjectValueByPath(props.item, props.itemKey),
    );

    const children = computed(() => {
      return (
        getObjectValueByPath(props.item, props.itemChildren as string) ?? []
      ).slice();
    });

    const imLeaf = computed(() => children.value.length < 1);

    const searchLoading = computed(() => {
      return treeView.searchLoading.value;
    });

    const leaves = computed(() => {
      return children.value.filter((leaf: any) => {
        return !treeView.isExcluded(getObjectValueByPath(leaf, props.itemKey));
      });
    });

    const childrenSelection = computed(() =>
      treeView.selectedState.value(
        myKey.value,
        children.value.map((child: any) =>
          getObjectValueByPath(child, props.itemKey),
        ),
      ),
    );

    const childrenAllChecked = computed(() => {
      return !!children.value?.length && childrenSelection.value.all;
    });

    const childrenSomeChecked = computed(() => {
      return (
        (props.selectStrategy === 'relative' ||
          props.selectStrategy === 'leaf') &&
        (children.value?.length ?? 0) > 0 &&
        !childrenAllChecked.value &&
        childrenSelection.value.some
      );
    });

    const isChecked = computed(() => {
      return (
        selected.value ||
        (props.selectStrategy === 'leaf' && childrenAllChecked.value)
      );
    });

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
      return getObjectValueByPath(props.item, props.itemText) ?? '';
    });

    const disabledSelect = computed(() => {
      if (props.itemSelectable != null) {
        let selectable = true;
        if (typeof props.itemSelectable === 'function') {
          selectable = !!props.itemSelectable(props.item);
        } else if (Array.isArray(props.itemSelectable)) {
          selectable = props.itemSelectable.includes(myKey.value);
        } else {
          selectable = getPropertyFromItem(
            props.item,
            props.itemSelectable,
            true,
          );
        }

        return !selectable;
      }
      return false;
    });

    const slotProps = computed(() => {
      return {
        level: props.level,
        imLeaf: imLeaf.value,
        toggleActive,
      };
    });

    watch(childrenSomeChecked, (value) => {
      indeterminate.value = value;
    });

    function toggleActive(e?: MouseEvent) {
      const to = !active.value;
      active.value = to;
      treeView.updateActive(myKey.value, to, e);
      treeView.emitActive();
    }

    function onClick(e: MouseEvent) {
      toggleActive(e);
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
      if (disabledSelect.value) return;
      const to = !isChecked.value;
      selected.value = to;
      treeView.updateSelected(myKey.value, to);
      treeView.emitSelected();
    }

    function onMouseenterContainer(e: MouseEvent) {
      props.onMouseenterContainer?.(e, {
        ...slotProps.value,
        item: props.item,
      });
    }

    function onMouseleaveContainer(e: MouseEvent) {
      props.onMouseleaveContainer?.(e, {
        ...slotProps.value,
        item: props.item,
      });
    }

    function onMousemoveContainer(e: MouseEvent) {
      props.onMousemoveContainer?.(e, { ...slotProps.value, item: props.item });
    }

    useRender(() => {
      const indentSpacer: VNodeArrayChildren = [];
      for (let i = 0; i < props.level; i += 1) {
        indentSpacer.push(
          <div class={'y-tree-view-node__indent-spacer'}></div>,
        );
      }

      return (
        <div
          class={classes.value}
          style={styles.value}
          role="treeitem"
          data-level={props.level}
        >
          <div
            ref={container$}
            class={'y-tree-view-node__container'}
            onClick={(e: MouseEvent) =>
              props.enableActive ? onClick(e) : void 0
            }
            onMouseenter={props.onMouseenterContainer && onMouseenterContainer}
            onMouseleave={props.onMouseleaveContainer && onMouseleaveContainer}
            onMousemove={props.onMousemoveContainer && onMousemoveContainer}
          >
            <YPlate />
            <div class={'y-tree-view-node__indents'}>{indentSpacer}</div>
            {/*  EXPAND  */}
            {!imLeaf.value && leaves.value.length > 0 ? (
              <YButton
                class={'y-tree-view-node__expand-icon'}
                variation={'icon'}
                onClick={onClickExpand}
              >
                {slots['expand-icon'] ? (
                  slots['expand-icon']()
                ) : (
                  <YIconExpand></YIconExpand>
                )}
              </YButton>
            ) : (
              <i class={'y-tree-view-node__no-expand-icon'}></i>
            )}
            {/* SELECT */}
            {props.enableSelect && (
              // biome-ignore lint/a11y/useSemanticElements: passive
              <div
                class={[
                  'y-tree-view-node__select',
                  {
                    'y-tree-view-node__select--disabled': disabledSelect.value,
                  },
                ]}
                role="checkbox"
                aria-checked={isChecked.value}
                onClick={onClickSelect}
              >
                <YIconCheckbox
                  checked={isChecked.value}
                  indeterminate={!selected.value && childrenSomeChecked.value}
                  disabled={disabledSelect.value}
                ></YIconCheckbox>
              </div>
            )}
            {/* CONTENT */}
            <div class={'y-tree-view-node__content'}>
              {slots.leading && (
                <div class={'y-tree-view-node__leading'}>
                  {slots.leading(slotProps.value)}
                </div>
              )}
              <div class={'y-tree-view-node__text'}>
                {slots.default ? (
                  slots.default?.({
                    text: contentText.value,
                    item: props.item,
                    ...slotProps.value,
                  })
                ) : props.search && !searchLoading.value ? (
                  <YTextHighlighter
                    text={contentText.value}
                    keyword={props.search}
                  ></YTextHighlighter>
                ) : (
                  contentText.value
                )}
              </div>
              {slots.trailing && (
                <div class={'y-tree-view-node__trailing'}>
                  {slots.trailing(slotProps.value)}
                </div>
              )}
            </div>
          </div>
          {/* CHILDREN */}
          {children.value.length > 0 && (
            <YExpandVTransition disabled={props.disableTransition}>
              {expanded.value && (
                <div class={['y-tree-view-node__leaves']} role="tree">
                  {leaves.value.map((item: any) => {
                    return (
                      <YTreeNode
                        {...mergeProps(props)}
                        key={getObjectValueByPath(item, props.itemKey)}
                        level={(props.level ?? 0) + 1}
                        item={item}
                      >
                        {{
                          default:
                            slots.default &&
                            ((...args: any[]) => slots.default?.(...args)),
                          'expand-icon':
                            slots['expand-icon'] &&
                            ((...args: any[]) =>
                              slots['expand-icon']?.(...args)),
                          leading:
                            slots.leading &&
                            ((...args: any[]) => slots.leading?.(...args)),
                          trailing:
                            slots.trailing &&
                            ((...args: any[]) => slots.trailing?.(...args)),
                        }}
                      </YTreeNode>
                    );
                  })}
                </div>
              )}
            </YExpandVTransition>
          )}
        </div>
      );
    });

    const nodeState = {
      myKey,
      expanded,
      active,
      selected,
      indeterminate,
    };

    expose(nodeState);

    onBeforeMount(() => {
      treeView?.register?.(myKey.value, nodeState);
    });

    return {
      treeView,
      myKey,
      expanded,
      active,
      selected,
      indeterminate,
      childrenSelection,
    };
  },
});

export type YTreeNode = InstanceType<typeof YTreeViewNode>;
