import { ref, shallowRef } from 'vue';

import { useResizeObserver } from '@/composables/resize-observer';
import { debounce } from '@/util/debounce';

export function useRectMeasure() {
  const tableRef = ref();
  const wrapperRef = ref();

  const containerRect = shallowRef<DOMRectReadOnly>();
  const wrapperRect = shallowRef<DOMRectReadOnly>();
  const tableRect = shallowRef<DOMRectReadOnly>();

  const debounceMeasure = debounce(measure, 100);

  const { resizeObservedRef: containerRef } = useResizeObserver((entries) => {
    setTimeout(() => {
      debounceMeasure(entries);
    });
  });

  function measure(entries: any) {
    containerRect.value = entries?.[0]?.contentRect;
    const el = containerRef.value!;
    const wrapperEl = el.querySelector('.y-table__wrapper');
    if (wrapperEl) {
      wrapperRect.value = wrapperEl.getBoundingClientRect();
    }
    if (tableRef.value) {
      const rect = tableRef.value?.getBoundingClientRect();
      if (rect) {
        tableRect.value = rect;
      }
    }
  }

  return {
    containerRef,
    wrapperRef,
    tableRef,
    containerRect,
    wrapperRect,
    tableRect,
  };
}
