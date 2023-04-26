import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      name: 'yuyeon',
      formats: ['es'],
      fileName: 'yuyeon',
    },
    rollupOptions: {
      external: ['vue', 'lottie-web'],
    },
  },
  plugins: [vue(), dts({ outputDir: 'types', copyDtsFiles: true })],
});
