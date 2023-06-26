import { PropType, defineComponent } from 'vue';

import './YIconSort.scss';

export const YIconSort = defineComponent({
  name: 'YIconSort',
  props: {
    direction: {
      type: String as PropType<'asc' | 'desc'>,
    },
    disabled: {
      type: Boolean,
    },
  },
  render() {
    return (
      <svg
        version="1.1"
        width="16"
        height="16"
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
        class={[
          'y-icon-sort',
          {
            'y-icon-sort--disabled': this.disabled,
            'y-icon-sort--asc': this.direction === 'asc',
            'y-icon-sort--desc': this.direction === 'desc',
          },
        ]}
      >
        <path
          d="m8.4146 12.52 7.5489-7.6399 7.622 7.4693"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="3"
          class="y-icon-sort__asc"
        />
        <path
          d="m8.4146 19.48 7.5489 7.6399 7.622-7.4693"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="3"
          class="y-icon-sort__desc"
        />
      </svg>
    );
  },
});
