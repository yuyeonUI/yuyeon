import { FunctionDirective } from 'vue';

const bindThemeClass: FunctionDirective = (el, binding) => {
  const themeName = binding.value;
  const themeClass = `theme--${themeName}`;
  el.classList.forEach((classToken: string) => {
    if (classToken.startsWith('theme--') && classToken !== themeClass) {
      el.classList.remove(classToken);
    }
  });
  el.classList.add(themeClass);
};

export default bindThemeClass;
