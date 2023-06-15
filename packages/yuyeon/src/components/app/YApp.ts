import { defineComponent, getCurrentInstance, h, onMounted } from 'vue';

import './YApp.scss';

/**
 * # App Component
 */
export const YApp = defineComponent({
  name: 'YApp',
  setup(props, { slots }) {
    // onMounted(() => {
    //   const vm = getCurrentInstance()!;
    //   if (vm.parent === vm.root) {
    //     const rootEl = vm.root.vnode.el?.parentElement as HTMLElement;
    //     if (rootEl) {
    //       rootEl.classList.add('y-root');
    //     }
    //   }
    // });

    return () =>
      h(
        'y-app',
        { class: 'y-app' },
        h('div', { class: 'y-app__container' }, slots),
      );
  },
});

export type YApp = InstanceType<typeof YApp>;
