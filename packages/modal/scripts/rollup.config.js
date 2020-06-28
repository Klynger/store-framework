import jsx from 'acorn-jsx'
import babel from '@rollup/plugin-babel'
import replace from '@rollup/plugin-replace'
import { terser } from 'rollup-plugin-terser'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import nodeResolve from '@rollup/plugin-node-resolve'
// import { sizeSnapshot } from 'rollup-plugin-size-snapshot'

const input = './src/index.ts'
const globals = {
  react: 'React',
  'react-dom': 'ReactDOM',
}

const babelOptions = {
  exclude: /node_modules/,
  // We are using @babel/plugin-transform-runtime
  runtimeHelpers: true,
  babelHelpers: 'runtime',
  configFile: '../../babel.config.js',
}

const commonOptions = {
  ignoreGlobal: true,
  include: /node_modules/,
}

export default [
  {
    input,
    output: {
      file: 'build/umd/modal.development.js',
      format: 'umd',
      name: 'StoreFrameworkModal',
      globals,
    },
    external: Object.keys(globals),
    acornInjectPlugins: [jsx()],
    plugins: [
      typescript({ tsconfig: './tsconfig.json' }),
      nodeResolve(),
      babel(babelOptions),
      commonjs(commonOptions),
      replace({ 'proccess.env.NODE_ENV': JSON.stringify('development') })
    ],
  },
  {
    input,
    output: {
      file: 'build/umd/modal.production.min.js',
      format: 'umd',
      name: 'StoreFrameworkModal',
      globals,
    },
    external: Object.keys(globals),
    acornInjectPlugins: [jsx()],
    plugins: [
      nodeResolve(),
      typescript({ tsconfig: './tsconfig.json' }),
      babel(babelOptions),
      commonjs(commonOptions),
      replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
      // sizeSnapshot({ snapshotPath: 'size-snapshot.json' }),
      terser()
    ]
  }
]
