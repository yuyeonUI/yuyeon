import { defineComponent } from 'vue';

import './YIconCheckbox.scss';

export const YIconCheckbox = defineComponent({
  name: 'YIconCheckbox',
  props: {
    checked: Boolean,
    immediate: Boolean,
  },
  render() {
    return (
      <svg
        class={[
          'y-icon-checkbox',
          {
            'y-icon-checkbox--checked': this.checked,
            'y-icon-checkbox--immediate': this.immediate,
          },
        ]}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path
          class="y-icon-checkbox__border-path"
          d="M 15.525 21.825 H 8.325 C 4.851 21.825 2.025 18.999 2.025 15.525 V 8.325 C 2.025 4.851 4.851 2.025 8.325 2.025 H 15.525 C 18.999 2.025 21.825 4.851 21.825 8.325 V 15.525 C 21.825 18.999 18.999 21.825 15.525 21.825 Z"
        />
        <path
          class="y-icon-checkbox__checkmark-path"
          fill="none"
          d="M5.73,11.91 11.1,16.28 17.79,7.59"
        ></path>
      </svg>
    );
  },
});
