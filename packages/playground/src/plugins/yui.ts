import { init } from '%/yuyeon/src';

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
