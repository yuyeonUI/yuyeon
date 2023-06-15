import { Component, ComponentInternalInstance } from "@vue/runtime-core";
import type { App } from 'vue';
import { nextTick, reactive } from "vue";

import * as components from './components';
import { createThemeModule } from './composables/theme';
import PlateWave from './directives/plate-wave';
import { YUYEON_LOGO } from './etc';
//
import './styles/base.scss';


const defaultOptions = {
  credit: true,
};

declare module 'vue' {
  interface ComponentCustomProperties {
    $yuyeon: any;
  }
}

export function init(options: any = defaultOptions) {
  const themeModule = createThemeModule(options?.theme);

  const install = (app: App): any => {
    themeModule.install(app);

    const yuyeon = reactive({
      app: null as ComponentInternalInstance | null,
      root: null as HTMLElement | null,
      theme: themeModule.instance,
    });

    Object.keys(components).forEach((componentName) => {
      const comp = components[componentName as keyof typeof components];
      app.component(componentName, comp as Component);
    });

    app.directive('plate-wave', PlateWave);

    app.provide('theme', yuyeon.theme);

    app.config.globalProperties.$yuyeon = yuyeon;

    nextTick(() => {
      yuyeon.app = app._instance as any;
      yuyeon.root = app._container;
      if (!yuyeon.root) {
        throw new Error(`yuyeon: Can't found instance`);
      }
      const $el = yuyeon.root;
      $el.classList.add('y-root');
      $el.setAttribute('data-y-root', '');
      themeModule.init(yuyeon);
    });
    if (options?.credit) {
      console.log(YUYEON_LOGO);
    }
    const { unmount } = app;
    app.unmount = () => {
      unmount();
      themeModule.scope.stop();
      app.unmount = unmount;
    }
  };

  return {
    install,
    // theme: themeModule,
  };
}
