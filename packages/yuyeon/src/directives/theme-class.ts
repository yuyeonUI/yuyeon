import { FunctionDirective, watchEffect } from "vue";

const bindThemeClass: FunctionDirective = (el, binding, vnode) => {
  function bindingClass(themeClass: string) {
    el.classList.forEach((classToken: string) => {
      if (classToken.startsWith('theme--') && classToken !== themeClass) {
        el.classList.remove(classToken);
      }
    });
    el.classList.add(themeClass);
  }

  watchEffect(() => {
    const theme = (binding.instance as any)?.$yuyeon?.theme ?? (vnode as any)?.ctx?.root.appContext.config.globalProperties?.$yuyeon?.theme;
    const themeName = binding.value ?? theme.name ?? '';
    if (!themeName) { return; }
    const themeClass = `theme--${themeName}`;
    bindingClass(themeClass);
  }, { flush: 'post' });
};

export default bindThemeClass;
