import { computed, nextTick, ref, vShow, watch, withDirectives } from 'vue';

import { YCard } from '@/components/card';
import { YDivider } from '@/components/divider';
import { YList, YListGroupHeader, YListItem } from '@/components/list';
import { YMenu } from '@/components/menu';
import { YProgressBar } from '@/components/progress-bar';
import { useModelDuplex } from '@/composables/communication';
import { useI18n } from '@/composables/i18n';
import type { ListItem } from '@/composables/list-items';
import { getHtmlElement } from '@/util/component';
import { getScrollParent } from '@/util/scroll';

type SelectSlots = Record<string, any>;

type UseSelectMenuOptions = {
  items: { value: ListItem[] };
  selections: { value: ListItem[] };
  visibleItems?: { value: ListItem[] };
  focusedItem?: { value: ListItem | null };
  searchLoading?: { value: boolean };
  activeOffset?: { value: number };
  isSelected: (item: ListItem) => boolean;
  isNonSelectableItem: (item: ListItem) => boolean;
  select: (item: ListItem, event?: Event) => void;
  contentClass?: string;
  listId?: string;
  getItemId?: (item: ListItem, index: number) => string;
  openOnClickBase?: boolean;
  preserveFocusOnItemMousedown?: boolean;
};

export function useSelectMenu(
  props: any,
  slots: SelectSlots,
  options: UseSelectMenuOptions,
) {
  const menuRef = ref<InstanceType<typeof YMenu>>();
  const listRef = ref<InstanceType<typeof YList>>();
  const opened = useModelDuplex(props, 'opened');
  const { t } = useI18n();

  const extraMenuProps = computed(() => ({
    ...props.menuProps,
    ...(props.openOnFocus === undefined
      ? {}
      : { openOnFocus: props.openOnFocus }),
    ...(options.openOnClickBase === undefined
      ? {}
      : { openOnClickBase: options.openOnClickBase }),
    disabled: props.disabled || props.menuProps?.disabled,
    preventCloseBubble: true,
  }));

  const baseEl = computed(() => menuRef.value?.baseEl);

  function isSelected(item: ListItem) {
    return options.isSelected(item);
  }

  function onClickItem(item: ListItem, event: MouseEvent) {
    if (item.disabled || options.isNonSelectableItem(item)) return;
    options.select(item, event);
    if (!props.multiple) {
      setTimeout(() => {
        opened.value = false;
      }, 40);
    }
  }

  function onBlur(_event: FocusEvent) {
    requestAnimationFrame(() => {
      const contentEl = (menuRef.value as any)?.layer$?.content$;
      if (contentEl?.contains(document.activeElement)) {
        return;
      }
      if (opened.value && props.closeOnBlur) {
        opened.value = false;
      }
    });
  }

  function scrollToActiveItem() {
    if (
      options.selections.value.length === 0 &&
      !options.focusedItem?.value
    ) {
      return;
    }
    const listEl = getHtmlElement(listRef.value);
    if (!listEl) return;

    const activeEl = (
      listEl.querySelector('.y-combobox__item--focused') ??
      listEl.querySelector('.y-list-item--active')
    ) as HTMLElement | null;
    const contentEl = (menuRef.value as any)?.layer$?.content$ as
      | HTMLElement
      | undefined;
    if (!activeEl || !contentEl) return;

    const scrollEl = getScrollParent(activeEl);
    if (
      scrollEl &&
      (contentEl.contains(scrollEl) || contentEl.isSameNode(scrollEl))
    ) {
      const activeOffset = Math.max(0, options.activeOffset?.value ?? 0);
      scrollEl.scrollTo({
        top: activeEl.offsetTop - activeOffset,
        behavior: 'smooth',
      });
    }
  }

  watch(opened, (isOpened) => {
    if (isOpened) {
      nextTick(scrollToActiveItem);
    }
  });

  watch(
    () => options.focusedItem?.value,
    () => nextTick(scrollToActiveItem),
  );

  watch(
    () => options.activeOffset?.value,
    () => nextTick(scrollToActiveItem),
  );

  function renderList() {
    const items = options.visibleItems?.value ?? options.items.value;
    return (
      <YList
        ref={listRef}
        {...(options.listId ? { id: options.listId } : {})}
      >
        {items.map((item, index) => {
          if (item.raw?.type === 'divider') {
            return withDirectives(<YDivider />, [[vShow, !item.hide]]);
          }
          if (item.raw?.type === 'header') {
            return withDirectives(
              <YListGroupHeader>{item.text}</YListGroupHeader>,
              [[vShow, !item.hide]],
            );
          }

          const itemProps = {
            item,
            selected: isSelected(item),
            ...(options.focusedItem
              ? { focused: options.focusedItem.value === item }
              : {}),
            select: (event?: Event) => options.select(item, event),
          };

          return withDirectives(
            <YListItem
              {...props.listItemProps}
              onClick={(event) => onClickItem(item, event)}
              onMousedown={
                options.preserveFocusOnItemMousedown
                  ? (event: MouseEvent) => event.preventDefault()
                  : undefined
              }
              id={options.getItemId?.(item, index)}
              role={options.getItemId ? 'option' : undefined}
              aria-selected={
                options.getItemId ? isSelected(item) : undefined
              }
              class={[
                {
                  'y-list-item--active': isSelected(item),
                  'y-combobox__item--focused':
                    options.focusedItem?.value === item,
                },
              ]}
              disabled={item.disabled}
            >
              {{
                default: () => (slots.item ? slots.item(itemProps) : item.text),
                leading: slots['item-leading']
                  ? () => slots['item-leading'](itemProps)
                  : undefined,
                trailing: slots['item-trailing']
                  ? () => slots['item-trailing'](itemProps)
                  : undefined,
              }}
            </YListItem>,
            [[vShow, !item.hide]],
          );
        })}
      </YList>
    );
  }

  function renderMenu() {
    const items = options.visibleItems?.value ?? options.items.value;
    const contentClass = options.contentClass ?? 'y-select__content';
    const searchLoading = () =>
      options.searchLoading?.value ? <YProgressBar indeterminate /> : undefined;

    return (
      <YMenu
        ref={menuRef}
        offset={props.offset}
        position={props.position}
        align={props.align}
        origin={props.origin}
        content-classes={[contentClass]}
        maxHeight={props.maxHeight}
        open-delay={props.openDelay}
        close-delay={props.closeDelay}
        base="parent"
        {...extraMenuProps.value}
        v-model={opened.value}
      >
        {{
          default: slots.menu
            ? () => (
                <>
                  {searchLoading()}
                  {slots.menu()}
                </>
              )
            : () => (
                <YCard>
                  {searchLoading()}
                  {slots['menu-prepend']?.()}
                  {items.length > 0 ? (
                    renderList()
                  ) : (
                    <div class="y-select__no-options">
                      {t('$yuyeon.noItems')}
                    </div>
                  )}
                  {slots['menu-append']?.()}
                </YCard>
              ),
        }}
      </YMenu>
    );
  }

  return {
    menuRef,
    listRef,
    opened,
    baseEl,
    extraMenuProps,
    onBlur,
    renderMenu,
  };
}
