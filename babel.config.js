let defaultPresets

if (process.env.BABEL_ENV === 'es') {
  defaultPresets = []
} else {
  defaultPresets = [
    [
      '@babel/preset-env',
      {
        bugfixes: true,
        modules: ['esm', 'production-umd'].includes(process.env.BABEL_ENV)
          ? false
          : 'commonjs',
      },
    ],
  ]
}

// const defaultAlias = {
//   '@klynger/modal': './packages/modal/src',
// }

const productionPlugins = [
  '@babel/plugin-transform-react-constant-elements',
  'babel-plugin-transform-dev-warning',
  ['babel-plugin-react-remove-properties', { properties: ['data-testid'] }],
]

module.exports = {
  presets: defaultPresets.concat([
    '@babel/preset-react',
    [
      '@babel/preset-typescript',
      {
        // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export
        onlyRemoveTypeImports: true,
      },
    ],
  ]),
  plugins: [
    'babel-plugin-optimize-clsx',
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-object-rest-spread', { loose: true }],
    // any package needs to declare 7.9.6 as a runtime dependency. defualt is ^7.0.0
    ['@babel/plugin-transform-runtime', { version: '^7.9.6' }],
    // for IE 11 support
    '@babel/plugin-transform-object-assign',
  ],
  ignore: [/@babel[\\|/]runtime/], // Fix a Windows issue.
  env: {
    cjs: {
      plugins: productionPlugins,
    },
    // coverage: {}, // TODO
    develpment: {
      plugins: [
        // [
        //   'babel-plugin-module-resolver',
        //   {
        //     alias: {
        //       modules: './modules',
        //     }
        //   }
        // ]
      ],
    },
    esm: {
      plugins: [
        ...productionPlugins,
        ['@babel/plugin-transform-runtime', { useESModules: true }],
      ],
    },
    es: {
      plugins: [
        ...productionPlugins,
        ['@babel/plugin-transform-runtime', { useESModules: true }],
      ],
    },
    production: {
      plugins: [
        ...productionPlugins,
        ['@babel/plugin-transform-runtime', { useESModules: true }],
      ],
    },
    'production-umd': {
      plugins: [
        ...productionPlugins,
        ['@babel/plugin-transform-runtime', { useESModules: true }],
      ],
    },
    // test: {}, // TODO
  },
}
