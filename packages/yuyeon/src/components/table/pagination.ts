import {
  InjectionKey,
  PropType,
  Ref,
  computed,
  inject,
  provide,
  watchEffect,
} from 'vue';

import { useModelDuplex } from '../../composables/communication';
import { clamp } from '../../util/common';
import { propsFactory } from '../../util/vue-component';

export const Y_DATA_TABLE_PAGINATION_KEY: InjectionKey<{
  page: Ref<number>;
  pageSize: Ref<number>;
  startIndex: Ref<number>;
  endIndex: Ref<number>;
  pageLength: Ref<number>;
  total: Ref<number>;
  prevPage: () => void;
  nextPage: () => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}> = Symbol.for('yuyeon.data-table.pagination');

export const pressDataTablePaginationProps = propsFactory(
  {
    page: {
      type: [Number, String] as PropType<number | string>,
      default: 0,
    },
    pageSize: {
      type: [Number, String] as PropType<number | string>,
      default: 10,
    },
  },
  'YDataTable__pagination',
);

type PaginationProps = {
  page: number | string;
  'onUpdate:page': ((v: any) => void) | undefined;
  pageSize: number | string;
  'onUpdate:pageSize': ((v: any) => void) | undefined;
  total?: number | string;
};

export function createPagination(props: PaginationProps) {
  const page = useModelDuplex(
    props,
    'page',
    undefined,
    (value) => +(value ?? 0),
  );
  const pageSize = useModelDuplex(
    props,
    'pageSize',
    undefined,
    (value) => +(value ?? 10),
  );
  return { page, pageSize };
}

export function providePagination(options: {
  page: Ref<number>;
  pageSize: Ref<number>;
  total: Ref<number>;
}) {
  const { page, pageSize, total } = options;

  const startIndex = computed(() => {
    if (pageSize.value === -1) return 0;

    return pageSize.value * (page.value - 1);
  });
  const endIndex = computed(() => {
    if (pageSize.value === -1) return total.value;

    return Math.min(total.value, startIndex.value + pageSize.value);
  });

  const pageLength = computed(() => {
    if (pageSize.value === -1 || total.value === 0) return 1;

    return Math.ceil(total.value / pageSize.value);
  });

  watchEffect(() => {
    if (page.value > pageLength.value) {
      page.value = pageLength.value;
    }
  });

  function setPageSize(value: number) {
    pageSize.value = value;
    page.value = 1;
  }

  function nextPage() {
    page.value = clamp(page.value + 1, 1, pageLength.value);
  }

  function prevPage() {
    page.value = clamp(page.value - 1, 1, pageLength.value);
  }

  function setPage(value: number) {
    page.value = clamp(value, 1, pageLength.value);
  }

  const data = {
    page,
    pageSize,
    startIndex,
    endIndex,
    pageLength,
    total,
    nextPage,
    prevPage,
    setPage,
    setPageSize,
  };

  provide(Y_DATA_TABLE_PAGINATION_KEY, data);

  return data;
}

export function usePagination() {
  const data = inject(Y_DATA_TABLE_PAGINATION_KEY);
  if (!data) throw new Error('Missing pagination!');
  return data;
}
