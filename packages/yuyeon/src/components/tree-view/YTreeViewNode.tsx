import {
  PropType,
  SlotsType,
  VNodeArrayChildren,
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  inject,
  mergeProps,
  onBeforeMount,
  ref, resolveComponent,
} from 'vue';

import { pressItemsPropsOptions } from '../../abstract/items';
import { useRender } from '../../composables/component';
import { getObjectValueByPath } from '../../util/common';
import { propsFactory } from '../../util/vue-component';
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
    activeClass: [String, Array],
    activeSingleModifier: String,
    requiredActive: Boolean,
    activeColor: {
      type: String,
      default: 'primary',
    },
    enableSelect: Boolean,
    onMouseenterContainer: Function,
    onMouseleaveContainer: Function,
    onMousemoveContainer: Function,
    ...pressItemsPropsOptions({
      itemKey: 'id',
    }),
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
  slots: Object as SlotsType<{
    default: any;
    'expand-icon': any;
    leading: any;
    trailing: any;
  }>,
  setup(props, { slots, expose }) {
    const YTreeNode = resolveComponent('YTreeViewNode', true) as any;
    const vm = getCurrentInstance();
    const treeView = inject<any>('tree-view');
    const container$ = ref<HTMLElement>();

    const expanded = ref(false);
    const active = ref(false);
    const selected = ref(false);
    const immediate = ref(false);

    const children = computed(() => {
      return (getObjectValueByPath(props.item, props.itemChildren as string) ?? []).slice();
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
      return getObjectValueByPath(props.item, props.itemText) ?? '';
    });

    const slotProps = computed(() => {
      return {
        level: props.level,
        imLeaf: imLeaf.value,
      };
    });

    const searchLoading = computed(() => {
      return treeView.searchLoading.value;
    });

    const leaves = computed(() => {
      return children.value.filter((leaf: any) => {
        return !treeView.isExcluded(getObjectValueByPath(leaf, props.itemKey));
      });
    });

    function onClick(e: MouseEvent) {
      const to = !active.value;
      active.value = to;
      treeView.updateActive(myKey.value, to, e);
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

    function onMouseenterContainer(e: MouseEvent) {
      props.onMouseenterContainer?.(e, { ...slotProps.value, item: props.item });
    }

    function onMouseleaveContainer(e: MouseEvent) {
      props.onMouseleaveContainer?.(e, { ...slotProps.value, item: props.item });
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
              <div class={'y-tree-view-node__select'} onClick={onClickSelect}>
                <YIconCheckbox checked={selected.value}></YIconCheckbox>
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

    onBeforeMount(() => {
      treeView?.register?.(myKey.value, vm!.exposed);
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
});

export type YTreeNode = InstanceType<typeof YTreeViewNode>;
