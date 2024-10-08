import { readonly, ref } from 'vue';
import { onBeforeUnmount } from 'vue';
import { watch } from 'vue';

import { getHtmlElement } from '../util/vue-component';
import Environments from '../util/environments';

export function useResizeObserver(callback?: ResizeObserverCallback) {
  const resizeObservedRef = ref<HTMLElement>();
  const contentRect = ref<DOMRectReadOnly>();
  if (Environments.canUseResizeObserver) {
    const observer = new ResizeObserver((entries, observer) => {
      callback?.(entries, observer);
      if (!entries.length) return;
      contentRect.value = entries[0].contentRect;
    });

    onBeforeUnmount(() => {
      observer.disconnect();
    });

    watch(
        resizeObservedRef,
        (neo, old) => {
          if (old) {
            observer.unobserve(getHtmlElement(old));
            contentRect.value = undefined;
          }
          if (neo) {
            observer.observe(getHtmlElement(neo));
          }
        },
        { flush: 'post' },
    );
  }

  return {
    resizeObservedRef,
    contentRect: readonly(contentRect),
  };
}
