import { init } from '%/yuyeon/src';

// import palette from '@/settings/palette';

const yui = init({
  theme: {
    themes: {
      light: {
        colors: {
          background: '#f1f1f1',
          surface: '#ffffff',
        },
      },
    }
  },

  credit: false,
});

export default yui;
