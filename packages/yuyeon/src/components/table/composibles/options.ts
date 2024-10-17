import { type Ref, computed, watch } from 'vue';

import { deepEqual } from '@/util/common';

import { SortOption } from '../types';

type DataTableOptionsState = {
  page: Ref<number>;
  pageSize: Ref<number>;
  sortBy: Ref<readonly SortOption[]>;
  search: Ref<string | undefined>;
};

export function useOptions(
  { page, pageSize, sortBy, search }: DataTableOptionsState,
  emit: Function,
) {
  const options = computed(() => {
    return {
      page: page.value,
      pageSize: pageSize.value,
      sortBy: sortBy.value,
      search: search.value,
    };
  });

  watch(
    () => search?.value,
    () => {
      page.value = 1;
    },
  );

  let optionsCache = null as unknown;

  watch(
    options,
    () => {
      if (deepEqual(optionsCache, options.value)) {
        return;
      }
      emit('update:options', options.value);
      optionsCache = options.value;
    },
    { deep: true, immediate: true },
  );
}
