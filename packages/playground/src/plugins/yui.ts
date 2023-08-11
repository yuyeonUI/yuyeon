import { init } from "yuyeon";

const yui = init({
  theme: {
    themes: {
      light: {
        colors: {
          background: "#f1f1f1",
          surface: "#ffffff",
        },
      },
      dark: {
        isDark: true,
        colors: {
          background: "#24262a",
          // surface: "#212121",
        },
      },
    },
  },

  credit: false,
});

export default yui;
