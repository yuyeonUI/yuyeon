import { App } from 'vue';

export const Y_THEME_PREFIX = 'y-theme';

const defaultThemeTemplates: any = {
  light: {
    dark: false,
    palette: {
      background: '#ffffff',
      'font-color': '#323232',
    },
    variables: {
      //
    },
  },
};

export function bindTheme(options: any) {
  function install(app: App) {
    //
  }
  return {
    install,
  };
}
