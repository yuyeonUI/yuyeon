import * as components from './components';
import { bindTheme } from './composables/theme';
//
import './styles/base.scss';

export function init(options: any) {
  const themeModule = bindTheme(options?.theme);

  const install = (app: any): void => {
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
