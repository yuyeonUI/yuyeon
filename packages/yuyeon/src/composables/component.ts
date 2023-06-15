import { ComponentInternalInstance } from '@vue/runtime-core';
import { ComponentPublicInstance, VNode, getCurrentInstance } from 'vue';

interface RedefinedComponentInternalInstance extends ComponentInternalInstance {
  render: () => VNode;
}

export function useRender(render: () => VNode) {
  const vm = getCurrentInstance() as RedefinedComponentInternalInstance | null;
  if (vm) {
    vm.render = render;
  }
}
