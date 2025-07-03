import { ref, shallowRef, watch } from 'vue';

import { useResizeObserver } from '@/composables/resize-observer';
import { debounce } from '@/util/debounce';

export function useRectMeasure() {
  const tableRef = ref<HTMLTableElement>();
  const wrapperRef = ref<HTMLElement>();

  const containerRect = shallowRef<DOMRectReadOnly>();
  const wrapperRect = shallowRef<DOMRectReadOnly>();
  const tableRect = shallowRef<DOMRectReadOnly>();

  const debounceMeasure = debounce(measure, 100);

  const { resizeObservedRef: containerRef } = useResizeObserver((entries) => {
    debounceMeasure(entries);
  });

  function measure(entries: any) {
    containerRect.value = entries?.[0]?.contentRect;

    if (wrapperRef.value) {
      const rect = wrapperRef.value.getBoundingClientRect();

      if (rect) {
        const obj: any = {};
        for (const key in rect) {
          if (typeof rect[key as keyof DOMRect] !== "function") {
            obj[key] = rect[key as keyof DOMRect];
          }
        }
        wrapperRect.value = {
          ...obj,
          clientWidth: wrapperRef.value?.clientWidth ?? 0,
        };
      }

    }

    if (tableRef.value) {
      const rect = tableRef.value?.getBoundingClientRect();
      if (rect) {
        tableRect.value = rect;
      }
    }
  }

  watch(tableRef, (neo) => {
    if (neo) {
      const el = containerRef.value!;
      wrapperRef.value = el.querySelector('.y-table__wrapper') as HTMLElement || undefined;
    }
  })

  return {
    containerRef,
    wrapperRef,
    tableRef,
    containerRect,
    wrapperRect,
    tableRect,
  };
}
