import { defineComponent } from 'vue';

export const YIconDropdown = defineComponent({
  name: 'YIconDropdown',
  setup() {
    return () => (
      <svg version="1.1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M7,10L12,15L17,10H7Z"
          fill="currentColor"
        />
      </svg>
    );
  },
});
