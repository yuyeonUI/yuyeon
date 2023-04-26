/*
 * Created by yeonyu 2022.
 */
//
import {
  ComponentPublicInstance,
  PropType,
  VNode,
  defineComponent,
  h,
  withKeys,
} from 'vue';

import RebindAttrs from '../../mixins/rebind-attrs';

const NAME = 'y-form';
const rootTags = ['form', 'div', 'section', 'article'];

export default defineComponent({
  name: NAME,
  inheritAttrs: false,
  mixins: [RebindAttrs],
  provide() {
    return {
      form$: this,
    };
  },
  props: {
    tag: {
      type: String as PropType<string>,
      default: 'form',
      validator(value: string) {
        return rootTags.includes(value);
      },
    },
    loading: Boolean,
  },
  data() {
    return {
      inputs: {} as Record<string, ComponentPublicInstance>,
      formData: {} as any,
    };
  },
  methods: {
    register(component: any) {
      const { iid, name } = component;
      // TODO: vue3 에서 $on 제거됨에 따라 트리거 따로 만들어야 함
      this.inputs[iid] = component;
    },
    unregister(component: any) {
      delete this.inputs[component.iid];
    },
    validate(): boolean {
      let flag = true;
      Object.values(this.inputs).forEach((input: any) => {
        const valid = input?.invokeValidators.call(input);
        flag = flag && valid;
      });
      return flag;
    },
  },
  computed: {
    attrs() {
      return {
        ...this.attrs_$,
      };
    },
  },
  render(): VNode {
    const { tag }: any = this;
    // this.attrs_$
    return h(
      tag,
      {
        class: NAME,
        '.novalidate': true,
        onSubmit: (e: Event) => {
          e.preventDefault();
          this.$emit('submit', e, this.formData);
        },
        onKeydown: withKeys(
          (e: Event) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.$emit('keydown.enter', e);
          },
          ['enter'],
        ),
      },
      this.$slots.default?.(),
    );
  },
});
