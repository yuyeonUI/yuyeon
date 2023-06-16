import { PropType, defineComponent } from 'vue';

export const PageControlPaths = {
  next: 'm12.392 26.896 7.2156-10.843-7.0545-10.948',
  prev: 'm19.608 26.896-7.2156-10.843 7.0545-10.948',
  last: 'm10.696 26.936 7.2156-10.843-7.0545-10.948m0 0zm10.447-0.105v21.921',
  first: 'm21.304 26.936-7.2156-10.843 7.0545-10.948m0 0zm-10.447-0.105v21.921',
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
