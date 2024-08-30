import { Component, ComponentInternalInstance } from '@vue/runtime-core';
import type { App } from 'vue';
import { getCurrentInstance, nextTick, reactive } from 'vue';

import * as components from './components';
import {
  YUYEON_DATE_KEY,
  YUYEON_DATE_OPTIONS_KEY,
  createDateModule,
} from './composables/date';
import { createI18nModule } from './composables/i18n';
import { YUYEON_I18N_KEY } from './composables/i18n/share';
import { YUYEON_ICON_KEY, createIconModule } from './composables/icon';
import {
  YUYEON_THEME_KEY,
  createThemeModule,
  useTheme,
} from './composables/theme';
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
  const i18nModule = createI18nModule(options?.i18n);
  const dateModule = createDateModule(options?.date, i18nModule.localeModule);
  const iconModule = createIconModule(options?.icon);
  const install = (app: App): any => {
    themeModule.install(app);

    const yuyeon = reactive({
      app: null as ComponentInternalInstance | null,
      root: null as HTMLElement | null,
      theme: themeModule.instance,
      i18n: {
        ...i18nModule.localeModule,
        ...i18nModule.rtlModule,
      },
      date: dateModule,
    });

    Object.keys(components).forEach((componentName) => {
      const comp = components[componentName as keyof typeof components];
      if (typeof comp === 'object' && 'name' in comp)
        app.component(componentName, comp as Component);
    });

    app.directive('plate-wave', PlateWave);

    app.provide(YUYEON_THEME_KEY, themeModule.instance);
    app.provide(YUYEON_ICON_KEY, iconModule);
    app.provide(YUYEON_I18N_KEY, {
      ...i18nModule.localeModule,
      ...i18nModule.rtlModule,
    });
    app.provide(YUYEON_DATE_OPTIONS_KEY, dateModule.options);
    app.provide(YUYEON_DATE_KEY, dateModule.instance);

    app.config.globalProperties.$yuyeon = yuyeon;

    nextTick(() => {
      yuyeon.root = app._container;
      yuyeon.app = app._instance as any;
      if (yuyeon.root) {
        yuyeon.root.classList.add('y-root');
        yuyeon.root.setAttribute('data-y-root', '');
        themeModule.init(yuyeon);
      }
    });

    if (options?.credit) {
      console.log(YUYEON_LOGO);
    }
    const { unmount, mount } = app;
    app.mount = (...args) => {
      const vm = mount(...args);
      if (!yuyeon.app) {
        yuyeon.app = app._instance as any;
      }
      if (!yuyeon.root) {
        nextTick(() => {
          yuyeon.root = app._container;
          if (yuyeon.root) {
            yuyeon.root.classList.add('y-root');
            yuyeon.root.setAttribute('data-y-root', '');
            themeModule.init(yuyeon);
          }
        });
      }
      app.mount = mount;
      return vm;
    };
    app.unmount = () => {
      unmount();
      themeModule.scope.stop();
      app.unmount = unmount;
    };
  };

  return {
    install,
  };
}

export function useYuyeon() {
  const vm = getCurrentInstance();
  if (!vm) throw new Error('[yuyeon] Called outside of setup context');

  return vm.appContext.config.globalProperties.$yuyeon;
}

export { useTheme };
