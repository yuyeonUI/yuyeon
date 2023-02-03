import { App } from 'vue';
import * as components from '@/components';
import { bindTheme } from '@/composables/theme';

export function init(options: any) {
  const themeModule = bindTheme(options?.theme);

  const install = (app: App) => {
    themeModule.install(app);

    Object.keys(components).forEach((componentName) => {
      const comp = components[componentName as keyof typeof components];
      app.component(componentName, comp);
    });
  };

  return {
    install,
    theme: themeModule,
  };
}
