import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import svgLoader from 'vite-svg-loader'
import { defineConfig } from "vite";
import { resolve } from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      {
        find: '@/',
        replacement: `${resolve('src')}/`,
      },
      {
        find: '%/',
        replacement: `${resolve('../')}/`,
      },
    ],
  },
  plugins: [vue(), vueJsx(), svgLoader({
    svgoConfig: {
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              removeViewBox: false,
            },
          },
        },
      ],
    },
  })],
});
