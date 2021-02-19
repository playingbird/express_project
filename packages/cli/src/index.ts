import cac from 'cac'
import pm from 'which-pm-runs'
import { exec } from 'child_process'
import { mkdir, writeFile } from 'fs/promises'
import { promisify } from 'util'
import { get } from 'httpie'
import * as colorette from 'colorette'
import editPkgJson from 'edit-json-file'
import ora from 'ora'
import pkgJson from './package.json'

const runCmd = promisify(exec)

const msg = (m: string, color: string) => console.log(colorette[color](m))

const ESLINT_JS_CONFIG = `
{
  "env": {
    "es6": true,
    "node": true
  },
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  "plugins": ["prettier"],
  "extends": ["eslint:recommended", "prettier"],
}
`

const ESLINT_TS_CONFIG = `
{
  "parser": "@typescript-eslint/parser",
  "extends": ["plugin:@typescript-eslint/recommended", "eslint:recommended", "prettier/@typescript-eslint"],
  "plugins": ["prettier"],
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  "env": {
    "node": true,
    "es6": true,
    "jest": true
  },
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "no-unused-vars": "off",
    "no-console": "off",
    "no-undef": "off"
  }
}
`

const PRETTIER_CONFIG = `
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 120,
  "trailingComma": "none",
  "tabWidth": 2
}
`

const install = (pkg: string, pkgs: string[], dev = true) =>
  runCmd(`${pkg} ${pkg === 'yarn' ? 'add' : 'i'} ${dev ? '-D' : '-S'} ${pkgs.join(' ')}`)

const cli = cac('tinyhttp')

let pkg: 'pnpm' | 'npm' | 'yarn'

const { options } = cli.parse()

const info = pm()

if (info?.name) pkg = info.name as typeof pkg

if (options.pkg) pkg = options.pkg

cli
  .version(pkgJson.version)
  .help()
  .command('new <project>', 'Create new tinyhttp project from template')
  .option('--prettier', 'Setup Prettier')
  .option('--eslint', 'Setup ESLint')
  .option('--eslint-ts', 'Setup ESLint for TypeScript')
  .option('--pkg [pkg]', 'Choose package manager')
  .action(async (name, options) => {
    msg(`Creating a new tinyhttp project from ${name} template ⚡`, 'cyan')

    msg('Fetching template contents ⌛', 'green')

    await mkdir(name)

    process.chdir(name)

    // CLI options

    if (options.prettier) {
      msg(`Setting up Prettier`, 'green')
      await install(pkg, ['prettier'])
      await writeFile('.prettierrc', PRETTIER_CONFIG)
    }

    if (options.eslint) {
      msg(`Setting up ESLint`, 'green')
      await install(pkg, ['eslint', 'prettier', 'eslint-config-prettier', 'eslint-plugin-prettier'], true)
      await writeFile('.eslintrc', ESLINT_JS_CONFIG)
    }

    if (options['eslint-ts']) {
      msg(`Setting up ESLint for TypeScript`, 'green')
      await install(pkg, [
        'typescript',
        'eslint',
        'eslint-config-prettier',
        'eslint-plugin-prettier',
        '@types/node',
        '@typescript-eslint/eslint-plugin',
        '@typescript-eslint/parser',
        'prettier'
      ])
      await writeFile('.eslintrc', ESLINT_TS_CONFIG)
    }

    const { data, statusCode } = await get(
      `https://api.github.com/repos/talentlessguy/tinyhttp/contents/examples/${name}`,
      {
        headers: { 'user-agent': 'node.js' }
      }
    )

    let spinner = ora()

    spinner.start(colorette.blue(`Fetching ${data.length} files...`))

    if (statusCode !== 200) console.warn(`Bad status code: ${statusCode}`)

    // Download files
    for (const { name, download_url } of data) {
      spinner.text = `Fetching ${name}`
      const { data } = await get(download_url)

      await writeFile(name, data)
    }

    spinner.stop()

    // Edit package.json

    const file = editPkgJson('package.json')

    const allDeps = Object.keys(file.get('dependencies'))

    // Replace "workspace:*" with "latest"

    const thDeps = allDeps.filter((x) => x.startsWith('@tinyhttp'))

    const newDeps = {}

    for (const dep of thDeps) newDeps[dep] = 'latest'

    file
      .set('dependencies', {
        ...file.get('dependencies'),
        ...newDeps
      })
      .save()

    // Install packages

    spinner = ora()

    spinner.start(colorette.cyan(`Installing ${allDeps.length} package${allDeps.length > 1 ? 's' : ''} with ${pkg} 📦`))

    await runCmd(`${pkg} ${pkg === 'yarn' ? 'add' : 'i'}`)

    spinner.stop()

    // Finish

    msg(`Done! You can now launch your project with \`${pkg} run start\``, 'blue')
  })
cli.parse()
