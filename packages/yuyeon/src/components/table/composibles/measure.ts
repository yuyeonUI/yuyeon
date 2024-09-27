import { ref } from 'vue';
import { useResizeObserver } from '@/composables';

export function useRectMeasure() {
  const containerRect = ref<DOMRectReadOnly>();
  const wrapperRect = ref<DOMRectReadOnly>();
  const tableRect = ref<DOMRectReadOnly>();

  const { resizeObservedRef: containerRef } = useResizeObserver((entries) => {
    requestAnimationFrame(() => {
      containerRect.value = entries?.[0]?.contentRect;
    })
  });

  const { resizeObservedRef: wrapperRef } = useResizeObserver((entries) => {
    requestAnimationFrame(() => {
      wrapperRect.value = entries?.[0]?.contentRect;
    })
  });

  const { resizeObservedRef: tableRef } = useResizeObserver((entries) => {
    requestAnimationFrame(() => {
      tableRect.value = entries?.[0]?.contentRect;
    })
  });

  return {
    containerRef,
    wrapperRef,
    tableRef,
    containerRect,
    wrapperRect,
    tableRect,
  }
}
