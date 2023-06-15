import { defineComponent } from 'vue';

import './YSpinnerRing.scss';

const NAME = 'YSpinnerRing';

export const YSpinnerRing = defineComponent({
  name: NAME,
  render() {
    return (
      <svg
        class="y-spinner-ring"
        width="48"
        height="48"
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          class="y-spinner-ring__circle"
          cx="24"
          cy="24"
          r="18"
          stroke-width="4"
          stroke-dasharray="113.097"
          stroke-dashoffset="113.097"
        />
      </svg>
    );
  },
});
