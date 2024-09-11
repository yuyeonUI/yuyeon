import type {
  ComponentInternalInstance,
  ComputedRef,
  ExtractPropTypes,
  InjectionKey,
  PropType,
  Ref,
  UnwrapRef,
} from 'vue';
import {
  computed,
  getCurrentInstance,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  reactive,
  toRef,
  watch,
} from 'vue';

import { wrapInArray } from '@/util/array';
import { deepEqual } from '@/util/common';
import {
  findChildrenWithProvide,
  getUid,
  propsFactory,
} from '@/util/component';

import { useModelDuplex } from './communication';

export interface ChoiceItem {
  id: number;
  value: Ref<unknown>;
  disabled: Ref<boolean | undefined>;
}

export interface ChoiceProps {
  disabled: boolean;
  modelValue: unknown;
  multiple?: boolean;
  mandatory?: boolean | 'force' | undefined;
  max?: number | undefined;
  selectedClass?: string | undefined;
  'onUpdate:modelValue': ((value: unknown) => void) | undefined;
}

export interface ChoiceProvide {
  register: (item: ChoiceItem, instance: ComponentInternalInstance) => void;
  unregister: (id: number) => void;
  select: (id: number, value: boolean) => void;
  selected: Ref<Readonly<number[]>>;
  selectedClass: Ref<string | undefined>;
  isSelected: (id: number) => boolean;
  disabled: Ref<boolean | undefined>;
  getItemIndex: (value: unknown) => number;
  prev: () => void;
  next: () => void;
  items: ComputedRef<
    { id: number; value: unknown; disabled: boolean | undefined }[]
  >;
}

export interface ChoiceItemProvide {
  id: number;
  isSelected: Ref<boolean>;
  toggle: () => void;
  select: (value: boolean) => void;
  selectedClass: Ref<(string | undefined)[] | false>;
  value: Ref<unknown>;
  disabled: Ref<boolean | undefined>;
  provider: ChoiceProvide;
}

export const pressChoicePropsOptions = propsFactory(
  {
    modelValue: {
      type: null,
      default: undefined,
    },
    multiple: Boolean,
    mandatory: [Boolean, String] as PropType<boolean | 'force'>,
    max: Number,
    selectedClass: String as PropType<string>,
    disabled: Boolean,
    returnItem: Boolean as PropType<boolean>,
  },
  'choice',
);

export const pressChoiceItemPropsOptions = propsFactory(
  {
    value: null,
    disabled: Boolean,
    selectedClass: String,
  },
  'choice-item',
);

export interface ChoiceItemProps
  extends ExtractPropTypes<ReturnType<typeof pressChoiceItemPropsOptions>> {
  'onChoice:selected': ((val: { value: boolean }) => void) | undefined;
}

export function useChoiceItem(
  props: ChoiceItemProps,
  injectKey: InjectionKey<ChoiceProvide>,
  required?: true,
): ChoiceItemProvide;
export function useChoiceItem(
  props: ChoiceItemProps,
  injectKey: InjectionKey<ChoiceProvide>,
  required: false,
): ChoiceItemProvide | null;
export function useChoiceItem(
  props: ChoiceItemProps,
  injectKey: InjectionKey<ChoiceProvide>,
  required = true,
): ChoiceItemProvide | null {
  const vm = getCurrentInstance();

  if (!vm) {
    throw new Error(
      '"useChoiceItem" must be used inside a component setup function',
    );
  }

  const id = getUid() as number;

  provide(Symbol.for(`${injectKey.description}:id`), id);

  const choiceProvider = inject(injectKey, null);

  if (!choiceProvider) {
    if (!required) return choiceProvider as null;

    throw new Error(`Not found provider`);
  }

  const value = toRef(props, 'value');
  const disabled = computed(
    () => !!(choiceProvider.disabled.value || props.disabled),
  );

  choiceProvider.register(
    {
      id,
      value,
      disabled,
    },
    vm,
  );

  onBeforeUnmount(() => {
    choiceProvider.unregister(id);
  });

  const isSelected = computed(() => {
    return choiceProvider.isSelected(id);
  });

  const selectedClass = computed(
    () =>
      isSelected.value && [
        choiceProvider.selectedClass.value,
        props.selectedClass,
      ],
  );

  watch(isSelected, (value) => {
    vm.emit('choice:selected', { value });
  });

  return {
    id,
    isSelected,
    toggle: () => choiceProvider.select(id, !isSelected.value),
    select: (value: boolean) => choiceProvider.select(id, value),
    selectedClass,
    value,
    disabled,
    provider: choiceProvider,
  };
}

export function useChoice(
  props: ChoiceProps,
  injectKey: InjectionKey<ChoiceProvide>,
) {
  let isUnmounted = false;
  const items = reactive<ChoiceItem[]>([]);
  const selected = useModelDuplex(
    props,
    'modelValue',
    [],
    (v) => {
      if (v == null) return [];

      return getIds(items, wrapInArray(v));
    },
    (v) => {
      const arr = getValues(items, v);

      return props.multiple ? arr : arr[0];
    },
  );

  const groupVm = getCurrentInstance();

  function register(item: ChoiceItem, vm: ComponentInternalInstance) {
    const unwrapped = item as unknown as UnwrapRef<ChoiceItem>;

    const key = Symbol.for(`${injectKey.description}:id`);
    const children = findChildrenWithProvide(key, groupVm?.vnode);
    const index = children.indexOf(vm);

    if (index > -1) {
      items.splice(index, 0, unwrapped);
    } else {
      items.push(unwrapped);
    }
  }

  function unregister(id: number) {
    if (isUnmounted) return;
    forceMandatoryValue();
    const index = items.findIndex((item) => item.id === id);
    items.splice(index, 1);
  }

  function forceMandatoryValue() {
    const item = items.find((item) => !item.disabled);
    if (item && props.mandatory === 'force' && !selected.value.length) {
      selected.value = [item.id];
    }
  }

  onMounted(() => {
    forceMandatoryValue();
  });

  onBeforeUnmount(() => {
    isUnmounted = true;
  });

  function select(id: number, value?: boolean) {
    const item = items.find((item) => item.id === id);
    if (value && item?.disabled) return;

    if (props.multiple) {
      const internalValue = selected.value.slice();
      const index = internalValue.findIndex((v: any) => v === id);
      const isSelected = ~index;
      value = value ?? !isSelected;
      if (isSelected && props.mandatory && internalValue.length <= 1) return;
      if (
        !isSelected &&
        props.max != null &&
        internalValue.length + 1 > props.max
      )
        return;

      if (index < 0 && value) internalValue.push(id);
      else if (index >= 0 && !value) internalValue.splice(index, 1);

      selected.value = internalValue;
    } else {
      const isSelected = selected.value.includes(id);
      if (props.mandatory && isSelected) return;
      selected.value = value ?? !isSelected ? [id] : [];
    }
  }

  function step(offset: number) {
    if (props.multiple) {
    }

    if (!selected.value.length) {
      const item = items.find((item) => !item.disabled);
      item && (selected.value = [item.id]);
    } else {
      const currentId = selected.value[0];
      const currentIndex = items.findIndex((i) => i.id === currentId);

      let newIndex = (currentIndex + offset) % items.length;
      let newItem = items[newIndex];

      while (newItem.disabled && newIndex !== currentIndex) {
        newIndex = (newIndex + offset) % items.length;
        newItem = items[newIndex];
      }

      if (newItem.disabled) return;

      selected.value = [items[newIndex].id];
    }
  }

  const state: ChoiceProvide = {
    register,
    unregister,
    selected,
    select,
    disabled: toRef(props, 'disabled'),
    prev: () => step(items.length - 1),
    next: () => step(1),
    isSelected: (id: number) => selected.value.includes(id),
    selectedClass: computed(() => props.selectedClass),
    items: computed(() => items),
    getItemIndex: (value: unknown) => getItemIndex(items, value),
  };

  provide(injectKey, state);

  return state;
}

function getItemIndex(items: UnwrapRef<ChoiceItem[]>, value: unknown) {
  const ids = getIds(items, [value]);

  if (!ids.length) return -1;

  return items.findIndex((item) => item.id === ids[0]);
}

function getIds(items: UnwrapRef<ChoiceItem[]>, modelValue: any[]) {
  const ids: number[] = [];

  modelValue.forEach((value) => {
    const item = items.find((item) => deepEqual(value, item.value));
    const itemByIndex = items[value];

    if (item?.value != null) {
      ids.push(item.id);
    } else if (itemByIndex != null) {
      ids.push(itemByIndex.id);
    }
  });

  return ids;
}

function getValues(items: UnwrapRef<ChoiceItem[]>, ids: any[]) {
  const values: unknown[] = [];
  ids.forEach((id) => {
    const itemIndex = items.findIndex((item) => item.id === id);
    if (~itemIndex) {
      const item = items[itemIndex];
      values.push(item.value != null ? item.value : itemIndex);
    }
  });

  return values;
}
