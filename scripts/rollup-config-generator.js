/* eslint-disable no-console */
const path = require('path')
const fs = require('fs')

const yargs = require('yargs')
const Handlebars = require('handlebars')

const defaultTemplatePath = '../../scripts/rollup-config.template.js'
const packagePath = process.cwd()
const targetPath = path.join(packagePath, './build')
const outputFileName = 'rollup.config.js'

/**
 * Ensure that the file path that you're trying to visit
 * exists.
 *
 * @param {string} filePath
 */
function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath)

  if (fs.existsSync(dirname)) {
    return true
  }

  ensureDirectoryExistence(dirname)
  fs.mkdirSync(dirname)
}

async function run(argv) {
  const { packageName, outDir, verbose, templatePath } = argv

  if (verbose) {
    console.log(`Reading template path "${templatePath}"`)
  }

  const configTemplate = fs.readFileSync(templatePath, 'utf-8')

  const splittedPackagePath = packagePath.split('/')
  const packageFileName = splittedPackagePath[splittedPackagePath.length - 1]

  if (verbose) {
    console.log('Compiling template...')
  }

  const template = Handlebars.compile(configTemplate)

  if (verbose) {
    console.log('Applying template variables...')
  }

  const filledFile = template({ packageName, packageFileName })
  const filePath = path.resolve(outDir, outputFileName)

  if (verbose) {
    console.log(
      `Verifying if the output directory exists "${path.dirname(outDir)}"`
    )
  }

  ensureDirectoryExistence(filePath)

  if (verbose) {
    console.log(`Writting file "${filePath}"`)
  }

  fs.writeFileSync(filePath, filledFile)
}

yargs
  .command({
    command: '$0 <packageName>',
    description: 'Generating Rollup configuration file',
    builder: (command) => {
      return command
        .positional('pacakgeName', {
          description: '',
          types: 'string',
        })
        .option('out-dir', { default: targetPath, type: 'string' })
        .option('template-path', {
          default: defaultTemplatePath,
          type: 'string',
        })
        .option('verbose', { type: 'boolean' })
    },
    handler: run,
  })
  .help()
  .strict(true)
  .version(false)
  .parse()
