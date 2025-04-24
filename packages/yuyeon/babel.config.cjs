const packageSpec = require('./package.json');

module.exports = {
  assumptions: {
    noDocumentAll: true,
  },
  ignore: [/\.d\.ts$/],
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    ['@vue/babel-plugin-jsx', { optimize: false, enableObjectSlots: false }],
    [
      'transform-define',
      {
        __YUYEON_VERSION__: packageSpec.version,
        __REQUIRED_VUE__: packageSpec.peerDependencies.vue,
      },
    ],
    [
      'module-resolver',
      {
        root: ['.'],
        alias: {
          '@': './src',
        },
      },
    ],
  ],
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: { node: true },
            modules: 'commonjs',
          },
        ],
      ],
    },
    lib: {
      ignore: ['**/__tests__'],
      plugins: [
        ['babel-plugin-add-import-extension', { extension: 'js' }],
        // ['./build/babel-plugin-replace-import-extension', { extMapping: {
        //     '.sass': '.css',
        //     '.scss': '.css',
        //   }}],
      ],
    },
  },
};
