import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    // minify: false,
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      name: 'yuyeon',
      formats: ['es', 'umd'],
      fileName: 'yuyeon',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
  plugins: [
    vue(),
    vueJsx({ optimize: false, enableObjectSlots: true }),
    dts({
      outDir: 'types',
      copyDtsFiles: true,
      exclude: ['src/vite-env.d.ts'],
    }),
  ],
  resolve: {
    alias: [
      {
        find: '@/',
        replacement: `${resolve('./src')}/`,
      },
    ],
  },
});
