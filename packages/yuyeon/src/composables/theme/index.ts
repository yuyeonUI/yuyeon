import type { App, ComputedRef, PropType, Ref } from 'vue';
import {
  computed,
  effectScope,
  getCurrentInstance,
  inject,
  provide,
  reactive,
  readonly,
  ref,
  unref,
  watch,
} from 'vue';

import bindThemeClass from '@/directives/theme-class';
import { propsFactory } from '@/util/component/props';

import { createPalette, createThemes } from './factory';
import { cssClass, cssVariables } from './helper';
import { ThemeScheme, configureOptions } from './setting';
import type { ThemeOptions } from './types';

export type { ThemeOptions };

export const Y_THEME_PREFIX = 'y-theme';

export interface ThemeModuleInstance {
  scheme: Ref<keyof typeof ThemeScheme | 'auto'>;
  theme: Ref<[string, string?]>;
  // theme values(schemes) for colors & variables
  readonly themes: any;
  readonly global: {
    // currentThemeKeys: [lightThemeKey, darkThemeKey]
    // If used manually, fix the scheme to 'light' and have a [lightThemeKey] value.
    // Use the appropriate default theme scheme if it does not match the themeKey
    scheme: Ref<keyof typeof ThemeScheme | 'auto'>;
    theme: Ref<[string, string?]>;
  };
  /* computed */
  readonly currentThemeKey: Readonly<ComputedRef<string>>;
  readonly themeClasses: Readonly<ComputedRef<string | undefined>>;
  readonly computedThemes: Readonly<ComputedRef<any>>;
  readonly computedPalette: Readonly<ComputedRef<any>>;
  /* */
  readonly supportedAutoMode: Readonly<Ref<boolean>>;
  readonly preferColorScheme: Readonly<Ref<'light' | 'dark'>>;
}

export const YUYEON_THEME_KEY = Symbol.for('yuyeon.theme');

export const pressThemePropsOptions = propsFactory(
  {
    theme: String as PropType<string>,
  },
  'theme',
);

export function isDarkMode() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function isSupportAutoScheme() {
  return window.matchMedia('(prefers-color-scheme)').media !== 'not all';
}

export function createThemeModule(options: ThemeOptions) {
  const appMountedScope = effectScope();
  const config = reactive(configureOptions(options));
  const scheme = ref<string>(config.scheme);
  const theme = ref<[string, string]>(config.theme);
  const themes = ref(config.themes);
  const palette = ref(config.palette);
  const supportedAutoMode = ref(true);
  const preferColorScheme = ref('');

  function darkModeWatcher(
    mediaQueryList: MediaQueryListEvent | MediaQueryList,
  ) {
    preferColorScheme.value = mediaQueryList.matches ? 'dark' : 'light';
  }

  const currentColorScheme = computed<'light' | 'dark'>(() => {
    if (scheme.value === 'auto') {
      return preferColorScheme.value as 'light' | 'dark';
    }
    if (scheme.value === 'dark') {
      return 'dark';
    }
    return 'light';
  });

  const currentThemeKey = computed(() => {
    if (typeof theme.value === 'string') {
      if (theme.value in computedThemes) {
        return theme.value;
      }
    }
    if (Array.isArray(theme.value)) {
      return currentColorScheme.value === 'dark'
        ? theme.value?.[1] ?? 'dark'
        : theme.value?.[0] ?? 'light';
    }
    return currentColorScheme.value;
  });

  const computedPalette = computed(() => {
    return createPalette(palette.value);
  });

  const computedThemes = computed(() => {
    return createThemes(themes.value);
  });

  const styles = computed(() => {
    const separationId = config.separation ? `#${config.separation}` : '';
    const lines = [];
    lines.push(
      ...cssClass(':root', cssVariables(computedPalette.value, 'palette')),
    );
    for (const [themeKey, themeDefs] of Object.entries(computedThemes.value)) {
      const { colors, variables, isDark } = themeDefs;
      const records: Record<string, string> = {
        ...colors,
        ...variables,
      };
      // if (currentThemeKey.value === themeKey) {
      //   lines.push(...cssClass(':root', cssVariables(records, 'theme')));
      // }
      const themeScheme = isDark ? 'dark' : 'light';
      if (scheme.value === 'auto') {
        lines.push(
          ...cssClass(
            `@media (prefers-color-scheme: ${themeScheme})`,
            cssClass(
              `${separationId}[data-theme-scheme='auto'][data-${themeScheme}-theme='${themeKey}']`,
              cssVariables(records, 'theme'),
            ),
          ),
        );
      } else {
        lines.push(
          ...cssClass(
            `${separationId}[data-theme-scheme='${themeScheme}'][data-${themeScheme}-theme='${themeKey}']`,
            cssVariables(records, 'theme'),
          ),
        );
      }

      lines.push(
        ...cssClass(
          `${separationId} .y-theme--${themeKey}`,
          cssVariables(records, 'theme'),
        ),
      );
    }
    return lines.join('');
  });

  function install(app: App) {
    app.directive('theme', bindThemeClass);

    let styleEl = document.getElementById(
      'yuyeon-theme-palette' +
        `${config.separation ? '__' + config.separation : ''}`,
    );

    watch(styles, updateStyleEl, { immediate: true });

    function updateStyleEl() {
      if (typeof document !== 'undefined' && !styleEl) {
        const el = document.createElement('style');
        el.type = 'text/css';
        el.id =
          'yuyeon-theme-palette' +
          `${config.separation ? '__' + config.separation : ''}`;
        if (options?.cspNonce) el.setAttribute('nonce', options.cspNonce);
        styleEl = el;
        document.head.appendChild(styleEl);
      }
      if (styleEl) {
        styleEl.innerHTML = styles.value;
      }
    }
  }

  function bindTheme(yuyeon: any) {
    supportedAutoMode.value = isSupportAutoScheme();
    if (supportedAutoMode.value) {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      darkModeWatcher(mql);
      mql.addEventListener('change' as 'change', darkModeWatcher);
    }
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
      (neo) => {
        yuyeon.root.setAttribute(
          'data-theme-scheme',
          neo === 'auto' ? 'auto' : currentColorScheme.value,
        );
      },
      { immediate: true },
    );
  }

  function init(yuyeon: any) {
    appMountedScope.run(() => {
      bindTheme(yuyeon);
    });
  }

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
      themes,
      scheme,
      theme,
      currentThemeKey,
      themeClasses,
      computedThemes,
      computedPalette,
      supportedAutoMode: readonly(supportedAutoMode),
      preferColorScheme: readonly(preferColorScheme),
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
      const moduleTheme = unref(themeModule.theme);
      switch (props.theme) {
        case 'light':
          return moduleTheme?.[0] ?? 'light';
        case 'dark':
          return moduleTheme?.[1] ?? 'dark';
        // TODO: props.theme(themeKey) validation in themes
        default:
          return props.theme;
      }
    }
    return unref(themeModule.currentThemeKey);
  });

  const themeClasses = computed(() => {
    return `y-theme--${currentThemeKey.value}`;
  });

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

  if (!theme) throw new Error('【yuyeon】 Not found provided "ThemeModule"');

  return theme;
}
