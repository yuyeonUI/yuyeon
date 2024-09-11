import { type Ref, computed, unref } from 'vue';

import { useI18n } from '@/composables/i18n';
import { getObjectValueByPath, isEmpty } from '@/util/common';

import type { SortOption } from '../types';

export function useSortedItems(
  props: any,
  items: Ref<any[]>,
  sortBy: Ref<readonly SortOption[]>,
  options?: {},
) {
  const { locale } = useI18n();
  const sortedItems = computed(() => {
    if (sortBy.value.length === 0) return items.value;
    return sortItems(items.value, sortBy.value, locale.value);
  });

  return {
    sortedItems,
  };
}

export function sortItems(
  items: any[],
  sortOptions: readonly SortOption[],
  locale: string,
) {
  const stringCollator = new Intl.Collator(locale, {
    sensitivity: 'accent',
    usage: 'sort',
  });
  const refined = items.map((item) => item);

  return refined
    .sort((a, b) => {
      for (let i = 0; i < sortOptions.length; i++) {
        const sortKey = sortOptions[i].key;
        const sortOrder = sortOptions[i].order ?? 'asc';

        if (sortOrder === false) continue;

        let sortA = getObjectValueByPath(unref(a.columns), sortKey);
        let sortB = getObjectValueByPath(unref(b.columns), sortKey);
        let sortARaw = unref(a.raw);
        let sortBRaw = unref(b.raw);

        if (sortOrder === 'desc') {
          [sortA, sortB] = [sortB, sortA];
          [sortARaw, sortBRaw] = [sortBRaw, sortARaw];
        }

        if (sortA instanceof Date && sortB instanceof Date) {
          return sortA.getTime() - sortB.getTime();
        }

        [sortA, sortB] = [sortA, sortB].map((s) =>
          s != null ? s.toString().toLocaleLowerCase() : s,
        );

        if (sortA !== sortB) {
          if (isEmpty(sortA) && isEmpty(sortB)) return 0;
          if (isEmpty(sortA)) return -1;
          if (isEmpty(sortB)) return 1;
          if (!isNaN(sortA) && !isNaN(sortB))
            return Number(sortA) - Number(sortB);
          return stringCollator.compare(sortA, sortB);
        }
      }

      return 0;
    })
    .map((item) => item);
}
