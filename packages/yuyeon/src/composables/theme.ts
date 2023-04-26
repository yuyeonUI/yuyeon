import { App } from 'vue';
import bindThemeClass from "../directives/theme-class";

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
    app.directive('theme', bindThemeClass);
  }
  return {
    install,
  };
}
