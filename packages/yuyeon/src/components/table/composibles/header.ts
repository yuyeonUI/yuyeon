import { type DeepReadonly, type InjectionKey, type PropType, type Ref, inject, provide, ref, watchEffect } from 'vue';



import { getRangeArr } from '@/util/common';
import { propsFactory } from '@/util/component';



import { type DataTableHeader, type InternalDataTableHeader } from '../types';


export const pressDataTableHeader = propsFactory(
  {
    headers: {
      type: Array as PropType<DeepReadonly<DataTableHeader[]>>,
      default: () => [],
    },
  },
  'YDataTable--header',
);

export const Y_DATA_TABLE_HEADER_KEY: InjectionKey<{
  headers: Ref<InternalDataTableHeader[][]>;
  columns: Ref<InternalDataTableHeader[]>;
}> = Symbol.for('yuyeon.data-table.header');

type HeaderProps = {
  headers: DeepReadonly<DataTableHeader[]> | undefined;
};

export function createHeader(
  props: HeaderProps,
  options?: {
    enableSelect?: Ref<boolean>;
  },
) {
  const headers = ref<InternalDataTableHeader[][]>([]);
  const columns = ref<InternalDataTableHeader[]>([]);

  watchEffect(() => {
    const rows = props.headers?.length
      ? [props.headers as DataTableHeader[]]
      : [];
    const flat = rows.flatMap((row, index) =>
      row.map((column) => ({ column, rowIndex: index })),
    );
    const rowCount = rows.length;
    const defaultHeader = { text: '', sortable: false };
    const defaultActionHeader = { ...defaultHeader, width: 48 };

    if (options?.enableSelect?.value) {
      const foundIndex = flat.findIndex(
        ({ column }) => column.key === 'data-table-select',
      );
      if (foundIndex < 0) {
        const fixed = flat.some(({ column }) => !!column?.fixed);
        flat.unshift({
          column: {
            ...defaultActionHeader,
            key: 'data-table-select',
            rowspan: rowCount,
            fixed,
          },
          rowIndex: 0,
        });
      } else {
        flat.splice(foundIndex, 1, {
          column: {
            ...defaultActionHeader,
            ...flat[foundIndex].column,
          },
          rowIndex: flat[foundIndex].rowIndex,
        });
      }
    }

    const fixedRows: InternalDataTableHeader[][] = getRangeArr(rowCount).map(
      () => [],
    );
    const fixedOffsets = getRangeArr(rowCount).fill(0);

    flat.forEach(({ column, rowIndex }) => {
      const { key } = column;
      for (
        let i = rowIndex;
        i <= rowIndex + (column.rowspan ?? 1) - 1;
        i += 1
      ) {
        fixedRows[i].push({
          ...column,
          key,
          fixedOffset: fixedOffsets[i],
          sortable: column.sortable ?? !!key,
        });
        fixedOffsets[i] += Number(column.width ?? 0);
      }
    });

    fixedRows.forEach((row) => {
      for (let i = row.length; (i -= 1); i >= 0) {
        if (row[i].fixed) {
          row[i].lastFixed = true;
          return;
        }
      }
    });

    const seen = new Set();
    headers.value = fixedRows.map((row) => {
      const filtered = [];
      for (const column of row) {
        if (!seen.has(column.key)) {
          seen.add(column.key);
          filtered.push(column);
        }
      }
      return filtered;
    });

    columns.value = fixedRows.at(-1) ?? [];
  });

  const data = { headers, columns };

  provide(Y_DATA_TABLE_HEADER_KEY, data);

  return data;
}

export function useHeader() {
  const data = inject(Y_DATA_TABLE_HEADER_KEY);
  if (!data) {
    throw new Error(`Not provided: ${Y_DATA_TABLE_HEADER_KEY.description}`);
  }
  return data;
}
