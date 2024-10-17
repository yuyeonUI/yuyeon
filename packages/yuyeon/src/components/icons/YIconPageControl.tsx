import { type PropType } from 'vue';

import { defineComponent } from '@/util/component';

export const PageControlPaths = {
  next: 'm12.18 23.585 7.6399-7.5489-7.4693-7.622',
  prev: 'm19.82 23.585-7.6399-7.5489 7.4693-7.622',
  last: 'm10.488 23.812 7.4981-7.7457-7.3307-7.8207m0 0zm10.856-0.075007v15.659',
  first:
    'm21.512 23.812-7.4981-7.7457 7.3307-7.8207m0 0zm-10.856-0.075007v15.659',
};

export const YIconPageControl = defineComponent({
  name: 'YIconPageControl',
  props: {
    type: {
      type: String as PropType<'next' | 'prev' | 'first' | 'last'>,
      default: 'next',
    },
  },
  render() {
    return (
      <svg version="1.1" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path
          d={
            this.$props.type in PageControlPaths
              ? PageControlPaths[this.$props.type]
              : PageControlPaths.next
          }
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="3"
        />
      </svg>
    );
  },
});
