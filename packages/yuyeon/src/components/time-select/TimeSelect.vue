<script setup lang="ts">
import {
  computed,
  type PropType,
  ref,
  shallowRef,
  useTemplateRef,
  watch,
} from 'vue';
import { getHtmlElement } from 'yuyeon/util';

import { useDate } from '@/composables';
import { validateDate } from '@/util/date/index';

const props = defineProps({
  variation: {
    type: String as PropType<string>,
    default: 'outlined',
  },
  offset: {
    type: [Number, String],
    default: 8,
  },
  position: {
    type: String as PropType<
      | 'start'
      | 'end'
      | 'top'
      | 'bottom'
      | 'default'
      | 'right'
      | 'left'
      | undefined
    >,
    default: 'bottom',
  },
  align: {
    type: String as PropType<
      'start' | 'end' | 'center' | 'top' | 'bottom' | undefined
    >,
    default: 'start',
  },
  //
  placeholder: {
    type: String as PropType<string>,
    default: 'hh:mm',
  },
  displayText: [Function, String] as PropType<
    string | ((dateTime: number) => string)
  >,
  maxHeight: {
    type: [Number, String],
  },
  name: String,
  //
  tabindex: {
    type: String as PropType<string>,
    default: '0',
  },
  label: String as PropType<string>,
  floating: { type: Boolean as PropType<boolean>, default: false },
  floated: { type: Boolean as PropType<boolean>, default: () => false },
  readonly: Boolean as PropType<boolean>,
  disabled: Boolean as PropType<boolean>,
  status: {
    type: String as PropType<'success' | 'warning' | 'error' | undefined>,
    validator(value: string) {
      return ['success', 'warning', 'error'].includes(value);
    },
  },
  helperText: String,
  validators: Array as PropType<((v: any) => boolean | string)[] | string[]>,
  validateOn: {
    type: String as PropType<string>,
  },
  validationValue: null,
  maxErrors: {
    type: [Number, String] as PropType<number | string>,
    default: 1,
  },
  allowed: [Array, Function],
  minutesStep: {
    type: Number,
    default: 15,
  },
});

const emit = defineEmits(['change']);

const dateUtil = useDate();
const formatter = Intl.DateTimeFormat(dateUtil.locale, {
  minute: 'numeric',
  hour: 'numeric',
  hour12: true,
  timeZone: 'UTC',
});

const time = defineModel({ type: Number });
const itemRefs = useTemplateRef('item');
const cardRefs = useTemplateRef('card');
const opened = shallowRef(false);
const input = shallowRef('');
const vFocusIndex = shallowRef(-1);
const inputResult = ref<any>();

const view = computed(() => {
  if (time.value != null) {
    const date = new Date(time.value);
    if (!validateDate(date)) return '';

    return `${formatter.format(date)}`;
  }

  return '';
});

const allowedFilter = computed(() => {
  const { allowed } = props;
  if (Array.isArray(allowed) && allowed.length > 0) {
    return (v: number) => (allowed as number[]).includes(v);
  }
  if (typeof allowed === 'function') {
    return (v: number) => allowed(v);
  }
  return null;
});

const items = computed(() => {
  const step = Math.min(props.minutesStep || 1, 24 * 60);
  const list = Array.from(
    { length: Math.floor((24 * 60) / step) },
    (_, i) => i * step,
  ).map((v) => {
    const value = v * 60 * 1000;
    const date = new Date(value);
    return {
      text: formatter.format(date),
      value: value,
    };
  });
  const aFilter = allowedFilter.value;
  if (aFilter) {
    return list.filter((item) => aFilter(item.value));
  }
  return list;
});

watch(
  view,
  (neo) => {
    input.value = neo;
  },
  { immediate: true },
);

watch(opened, (neo) => {
  if (!neo) {
    input.value = view.value;
    vFocusIndex.value = -1;
  } else {
    vFocusIndex.value = 0;
  }
});

function onInputField(event: InputEvent) {
  const el = event.target as HTMLInputElement;
  if (el) {
    const parsed = dateUtil.parseTime(el.value);
    let millis: number;
    if (parsed) {
      millis = parsed.hours * 3600000 + parsed.minutes * 60000;
      inputResult.value = {
        ...parsed,
        time: millis,
      };
      vFocusIndex.value = -1;
    } else {
      inputResult.value = undefined;
    }
  }
}

function onFocusField() {
  setTimeout(() => {
    opened.value = true;
  }, 100);
}

function onBlurField() {
  emitTime();
  setTimeout(() => {
    opened.value = false;
  }, 400);
}

function onKeydownField(event: Event) {
  const e = event as KeyboardEvent;
  const length = items.value.length;
  const index = vFocusIndex.value;
  if (e.key === 'ArrowDown') {
    event.preventDefault();
    opened.value = true;
    const nextIndex = getNextIndex(index, length, 1);
    vFocusIndex.value = nextIndex;
    focusItem(nextIndex);
  } else if (e.key === 'ArrowUp') {
    event.preventDefault();
    opened.value = true;
    const nextIndex = getNextIndex(index, length, -1);
    vFocusIndex.value = nextIndex;
    focusItem(nextIndex);
  } else if (e.key === 'Enter') {
    if (vFocusIndex.value != null) {
      const item = items.value[vFocusIndex.value];
      if (item) {
        onClickItem(event, item);
        opened.value = false;
      }
    } else {
      emitTime();
    }
  } else if (e.key === 'Escape') {
    opened.value = false;
  } else {
    opened.value = true;
  }
}

function emitTime() {
  const inputTime = inputResult.value?.time;
  if (inputTime != null) {
    if (
      !allowedFilter.value ||
      (allowedFilter.value && allowedFilter.value(inputTime))
    ) {
      time.value = inputTime;
    }
  }
}

function onClickItem(event: Event, item: any) {
  event.preventDefault();
  emit('change', item.value, time.value, event);
  time.value = item.value;
}

function focusItem(index: number) {
  if (cardRefs.value && itemRefs.value) {
    const itemRefIndex = itemRefs.value.findIndex?.((i) => {
      const el = getHtmlElement(i!) as HTMLElement;
      return el.dataset.index === String(index);
    });
    if (itemRefIndex != null && itemRefIndex !== -1) {
      const itemEl = getHtmlElement(itemRefs.value[itemRefIndex]!) as
        | HTMLElement
        | undefined;
      const cardEl = getHtmlElement(cardRefs.value);
      if (itemEl && cardEl) {
        cardEl.scrollTo({
          top: itemEl.offsetTop - cardEl.offsetHeight / 2,
        });
      }
    }
  }
}

function onMouseenterItem(index: number) {
  vFocusIndex.value = index;
}

function getNextIndex(
  index: number | undefined,
  length: number,
  direction: 1 | -1,
) {
  if (index == null) return 0;
  const next = index + direction;
  if (length <= next) {
    return 0;
  }
  if (next < 0) {
    return length - 1;
  }
  return next;
}
</script>

<template>
  <div class="time-select">
    <y-menu
      v-model="opened"
      :position="position"
      :align="align"
      :offset="offset"
      :max-height="maxHeight"
      :open-on-click-base="false"
      prevent-close-bubble
      content-classes="time-select-menu"
    >
      <template #base>
        <y-field-input
          v-model="input"
          :variation="variation"
          :placeholder="placeholder"
          :disabled="disabled"
          autocomplete="off"
          @input="onInputField"
          @focus="onFocusField"
          @blur="onBlurField"
          @keydown="onKeydownField"
        >
        </y-field-input>
      </template>
      <template #default>
        <y-card ref="card">
          <y-list>
            <template v-for="(item, index) in items" :key="index">
              <y-list-item
                ref="item"
                class="time-select-menu__item"
                :class="{ 'y-list-item--active': vFocusIndex === index }"
                :data-index="index"
                @mouseenter="onMouseenterItem(index)"
                @click="onClickItem($event, item)"
              >
                <slot name="item-text" :item="item" :index="index">
                  {{ item.text }}
                </slot>
              </y-list-item>
            </template>
          </y-list>
        </y-card>
      </template>
    </y-menu>
  </div>
</template>

<style lang="scss">
.time-select-menu {
  &__item .y-list-item--focused:before {
    opacity: 0.4;
  }
}
</style>
