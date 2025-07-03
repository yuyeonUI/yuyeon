import { type InjectionKey, Ref, ShallowRef } from 'vue';
import type { InternalDataTableHeader } from '@/components/table/types';
import { createSorting } from '@/components/table/composables/sorting';

export const YTableInjectionKey: InjectionKey<{
  tableRef: Ref<HTMLTableElement | undefined>
  containerRect: ShallowRef<DOMRectReadOnly | undefined>
  wrapperRef: Ref<HTMLElement | undefined>
  wrapperRect: ShallowRef<DOMRectReadOnly | undefined>
}> = Symbol.for('y-table');

export const YDataTableInjectionKey: InjectionKey<{
  toggleSort: (column: InternalDataTableHeader) => void;
  sortBy: ReturnType<typeof createSorting>['sortBy']
  headRect: Ref<DOMRectReadOnly | undefined>
}> =
  Symbol.for('y-data-table');
