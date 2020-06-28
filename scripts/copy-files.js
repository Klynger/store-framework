/* eslint-disable no-console */
const path = require('path')

const glob = require('glob')
const fse = require('fs-extra')

const packagePath = process.cwd()
const buildPath = path.join(packagePath, './build')
const srcPath = path.join(packagePath, './src')

/**
 * Puts a package.json into every immediate child directory of rootDir.
 * That package.json contains information about esm for bundlers so that imports
 * like import Backdrop from '@store-framework/modal/Backdrop' are tree-shakeable.
 *
 * @param {string} rootDir
 */
async function createModulePackages({ from, to }) {
  const directoryPackages = glob
    .sync('*/index.ts', { cwd: from })
    .map(path.dirname)

  await Promise.all(
    directoryPackages.map(async (directoryPackage) => {
      const packageJson = {
        sideEffects: false,
        module: path.join('../esm', directoryPackage, 'index.js'),
        typings: './index.d.ts',
      }

      const packageJsonPath = path.join(to, directoryPackage, 'package.json')

      const [typingsExist] = await Promise.all([
        fse.exists(path.join(to, directoryPackage, 'index.d.ts')),
        fse.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2)),
      ])

      if (!typingsExist) {
        throw new Error(`index.d.ts for ${directoryPackage} is missing`)
      }

      return packageJsonPath
    })
  )
}

async function prepend(file, string) {
  const data = await fse.readFile(file, 'utf8')

  await fse.writeFile(file, string + data, 'utf8')
}

async function addLicense(packageData) {
  const license = `/** @license Store-Framework v${packageData.version}
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
`

  await Promise.all(
    [
      './index.js',
      './esm/index.js',
      './umd/modal.development.js',
      './umd/modal.production.min.js',
    ].map(async (file) => {
      try {
        await prepend(path.resolve(buildPath, file), license)
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.log(`Skipped license for ${file}`)
        } else {
          throw err
        }
      }
    })
  )
}

async function includeFileInBuild(file) {
  const sourcePath = path.resolve(packagePath, file)
  const targetPath = path.resolve(buildPath, path.basename(file))

  await fse.copy(sourcePath, targetPath)
  console.log(`Copied ${sourcePath} to ${targetPath}`)
}

async function typescriptCopy({ from, to }) {
  const toExists = await fse.exists(to)

  if (!toExists) {
    console.warn(`path ${to} does not exist`)

    return []
  }

  const files = glob.sync('**/*.d.ts', { cwd: from })
  const cmds = files.map((file) =>
    fse.copy(path.resolve(from, file), path.resolve(to, file))
  )

  return Promise.all(cmds)
}

async function createPackageFile() {
  const packageData = await fse.readFile(
    path.resolve(packagePath, './package.json'),
    'utf8'
  )

  const {
    nyc,
    scripts,
    workspaces,
    devDependencies,
    ...packageDataOther
  } = JSON.parse(packageData)

  const newPackageData = {
    ...packageDataOther,
    private: false,
    main: './index.js',
    module: './esm/index.js',
  }

  const targetPath = path.resolve(buildPath, './package.json')

  await fse.writeFile(
    targetPath,
    JSON.stringify(newPackageData, null, 2),
    'utf8'
  )
  console.log(`Created package.json in ${targetPath}`)

  return newPackageData
}

async function run() {
  console.log('Start copying files to builds...')
  try {
    const packageData = await createPackageFile()

    await Promise.all(
      ['../../CHANGELOG.md', '../../LICENSE'].map(includeFileInBuild)
    )

    await addLicense(packageData)

    await typescriptCopy({ from: srcPath, to: buildPath })

    await createModulePackages({ from: srcPath, to: buildPath })
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

run()
