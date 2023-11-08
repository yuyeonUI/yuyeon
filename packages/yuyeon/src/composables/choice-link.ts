import { nextTick, watch } from 'vue';

import type { UseLink } from './vue-router';

export function useChoiceByLink(
  link: UseLink,
  select?: (value: boolean, event?: Event) => void,
) {
  watch(
    () => link.isActive?.value,
    (neo) => {
      if (link.isLink.value && neo && select) {
        nextTick(() => {
          select(true);
        });
      }
    },
    { immediate: true },
  );
}
