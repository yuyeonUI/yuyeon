import type { App } from 'vue';
import { effectScope, reactive, ref, toRaw, watch } from "vue";

import bindThemeClass from '../../directives/theme-class';
import { configureOptions, ThemeScheme } from "./setting";
import type { ThemeOptions } from "./setting";

export const Y_THEME_PREFIX = 'y-theme';

interface ThemeProvide {
  //
}

export const YUYEON_THEME_KEY = Symbol.for('yuyeon.theme');

export function createThemeModule(options: ThemeOptions) {
  const appMountedScope = effectScope();
  const config = reactive(configureOptions(options));
  const scheme = ref(config.scheme);
  const mode = ref(config.mode);
  const theme = ref<[string, string]>(config.theme);
  const themes = ref(config.themes);
  const themeState = reactive({
    scheme: scheme,
    theme: theme,
    themes: themes,
    mode: mode,
  });

  function install(app: App) {
    app.directive('theme', bindThemeClass);
  }

  function bindTheme(yuyeon: any) {
    console.log(toRaw(yuyeon.theme))
    watch(
      theme,
      (neo) => {
        const [lightTheme, darkTheme] = neo;
        yuyeon.root.dataset.lightTheme = lightTheme;
        yuyeon.root.dataset.darkTheme = darkTheme;
      },
      { immediate: true },
    );
    watch(
      scheme,
      (neo: string) => {
        yuyeon.root.setAttribute('data-theme-scheme', neo);
      },
      { immediate: true },
    );
  }

  function init(yuyeon: any) {
    appMountedScope.run(() => {
      bindTheme(yuyeon);
    });
  }

  return {
    install,
    init,
    scope: appMountedScope,
    instance: themeState,
  };
}
