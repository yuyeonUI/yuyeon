import { createPalette, createThemes } from './factory';
import { ThemeScheme, configureOptions } from './setting';
import type { ThemeOptions } from './types';
import type { App, ComputedRef, Ref } from 'vue';
import {
  computed,
  effectScope,
  getCurrentInstance,
  inject,
  provide,
  reactive,
  ref,
  unref,
  watch,
} from 'vue';

import bindThemeClass from '../../directives/theme-class';
import { propsFactory } from '../../util/vue-component';

export type { ThemeOptions };

export const Y_THEME_PREFIX = 'y-theme';

export interface ThemeModuleInstance {
  // 'manual', 'auto'
  readonly mode: string;
  // 'dark', 'light', 'normal'
  readonly scheme: keyof typeof ThemeScheme | 'normal';
  // currentTheme [lightTheme, darkTheme]
  readonly theme: Readonly<Ref<string | [string, string]>>;
  // theme values for theme strategy
  readonly themes: any;
  readonly global: {
    readonly scheme: keyof typeof ThemeScheme | 'normal';
    readonly theme: Ref<string | [string, string]>;
  };
  /* computed */
  readonly currentThemeKey: Readonly<ComputedRef<string>>;
  readonly themeClasses: Readonly<ComputedRef<string | undefined>>;
  readonly computedThemes: Readonly<ComputedRef<any>>;
  readonly computedPalette: Readonly<ComputedRef<any>>;
}

export const YUYEON_THEME_KEY = Symbol.for('yuyeon.theme');

export const pressThemePropsOptions = propsFactory(
  {
    theme: String,
  },
  'theme',
);

export function createThemeModule(options: ThemeOptions) {
  const appMountedScope = effectScope();
  const config = reactive(configureOptions(options));
  const scheme = ref(config.scheme);
  const mode = ref(config.mode);
  const theme = ref<string | [string, string]>(config.theme);
  const themes = ref(config.themes);
  const palette = ref(config.palette);

  const computedPalette = computed(() => {
    return createPalette(palette.value);
  });

  const computedThemes = computed(() => {
    return createThemes(themes.value);
  });

  const styles = computed(() => {
    computedPalette.value;
    return ':root { --y-theme-test: 0,0,0; }';
  });

  function install(app: App) {
    app.directive('theme', bindThemeClass);

    let styleEl = document.getElementById('yuyeon-theme-palette');

    watch(styles, updateStyleEl, { immediate: true });

    function updateStyleEl() {
      if (typeof document !== 'undefined' && !styleEl) {
        const el = document.createElement('style');
        el.type = 'text/css';
        el.id = 'yuyeon-theme-palette';
        if (options.cspNonce) el.setAttribute('nonce', options.cspNonce);
        styleEl = el;
        document.head.appendChild(styleEl);
      }
      if (styleEl) {
        styleEl.innerHTML = styles.value;
      }
    }
  }

  function bindTheme(yuyeon: any) {
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

  const currentThemeKey = computed(() => {
    if (scheme.value === 'normal') {
      if (Array.isArray(theme.value)) {
        return theme.value?.[0] ?? 'light';
      }
      return theme.value;
    }
    if (Array.isArray(theme.value)) {
      return scheme.value === 'dark'
        ? theme.value?.[1] ?? 'dark'
        : theme.value?.[0] ?? 'light';
    }
    return 'light';
  });

  const themeClasses = computed(() => `y-theme--${currentThemeKey.value}`);

  return {
    install,
    init,
    scope: appMountedScope,
    instance: {
      global: {
        scheme,
        theme,
      },
      mode,
      themes,
      scheme,
      theme,
      currentThemeKey,
      themeClasses,
      computedThemes,
      computedPalette,
    },
  };
}

export function useLocalTheme(props: { theme?: string }) {
  getCurrentInstance();

  const themeModule = inject<ThemeModuleInstance | null>(
    YUYEON_THEME_KEY,
    null,
  );

  if (!themeModule) throw new Error('Not found provided "ThemeModule"');

  const palette = themeModule.computedPalette;

  const currentThemeKey = computed<string>(() => {
    if (props.theme) {
      switch (props.theme) {
        case 'light':
          return themeModule.theme.value?.[0] ?? 'light';
        case 'dark':
          return themeModule.theme.value?.[1] ?? 'dark';
        // TODO: props.theme(themeKey) validation in themes
        default:
          return props.theme;
      }
    }
    return unref(themeModule.currentThemeKey);
  });

  const themeClasses = computed(() => `y-theme--${currentThemeKey.value}`);

  const newTheme: ThemeModuleInstance = {
    ...themeModule,
    currentThemeKey,
    themeClasses,
  };

  provide(YUYEON_THEME_KEY, newTheme);

  return newTheme;
}

export function useTheme() {
  getCurrentInstance();

  const theme = inject<ThemeModuleInstance | null>(YUYEON_THEME_KEY, null);

  if (!theme) throw new Error('Not found provided "ThemeModule"');

  return theme;
}
