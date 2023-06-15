import { PropType } from 'vue';
import { propsFactory } from "../../util/vue-component";
import { useModelDuplex } from "../../composables/communication";

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
