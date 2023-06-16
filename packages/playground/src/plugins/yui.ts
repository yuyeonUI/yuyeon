import { init } from 'yuyeon';

import palette from '@/settings/palette';

const yui = init({
  theme: {
    themes: {
      light: {
        colors: {
          primary: palette.primary,
        },
      },
    }
  },

  credit: false,
});

export default yui;
