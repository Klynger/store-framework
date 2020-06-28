/* eslint-disable no-console */
const path = require('path')
const childProcess = require('child_process')
const { promisify } = require('util')

const yargs = require('yargs')

const exec = promisify(childProcess.exec)

const validBundles = [
  // legacy build using commonJS modules
  'cjs',
  // modern build
  'es',
  // legacy build using ES6 modules
  'esm',
]

const bundlesPath = {
  cjs: '.',
  esm: './esm',
  es: './es',
}

async function run(argv) {
  const { bundle, outDir: relativeOutDir, verbose } = argv

  if (validBundles.indexOf(bundle) === -1) {
    throw new TypeError(
      `Unrecognized bundle '${bundle}'. Did you mean one of "${validBundles.join(
        '", "'
      )}"?`
    )
  }

  const env = {
    NODE_ENV: 'production',
    BABEL_ENV: bundle,
    PATH: process.env.PATH,
  }

  const babelConfigPath = path.resolve(__dirname, '../babel.config.js')
  const srcDir = path.resolve('./src')
  const outDir = path.resolve(relativeOutDir, bundlesPath[bundle])

  const command = [
    'yarn babel',
    '--config-file',
    babelConfigPath,
    '--extensions',
    '".js,.ts,.tsx"',
    srcDir,
    '--out-dir',
    outDir,
    '--ignore',
    '"**/*.spec.ts","**/*.test.ts","**/*.spec.tsx","**/*.test.tsx","**/*.d.ts"',
  ].join(' ')

  if (verbose) {
    console.log(`running ${command} with ${JSON.stringify(env)}`)
  }

  return exec(command, { env })
}

yargs
  .command({
    command: '$0 <bundle>',
    description: 'build package',
    builder: (command) => {
      return command
        .positional('bundle', {
          description: `Valid bundles: "${validBundles.join('" | "')}"`,
          type: 'string',
        })
        .option('out-dir', { default: './build', type: 'string' })
        .option('verbose', { type: 'boolean' })
    },
    handler: run,
  })
  .help()
  .strict(true)
  .version(false)
  .parse()
