![](https://tinyhttp.v1rtl.site/cover.jpg)

<div align="center">
<h1>tinyhttp</h1>

[![](https://img.shields.io/badge/website-visit-hotpink?style=flat-square)](https://tinyhttp.v1rtl.site) [![npm](https://img.shields.io/npm/dt/@tinyhttp/app?style=flat-square)](https://npm.im/@tinyhttp/app) [![npm type definitions](https://img.shields.io/npm/types/@tinyhttp/app?style=flat-square)](npmjs.com/@tinyhttp/app) ![GitHub Workflow Status](https://img.shields.io/github/workflow/status/talentlessguy/tinyhttp/CI?style=flat-square)
![Codecov](https://img.shields.io/codecov/c/gh/talentlessguy/tinyhttp?style=flat-square)
![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/body-parsec.svg?style=flat-square) ![Codacy grade](https://img.shields.io/codacy/grade/239a8cc7bca24042940f018a1ccec72f?style=flat-square) ![David (path)](https://img.shields.io/david/talentlessguy/tinyhttp?path=packages%2Fapp&style=flat-square)
![Last commit](https://img.shields.io/github/last-commit/talentlessguy/tinyhttp.svg?style=flat-square) [![NPM](https://img.shields.io/npm/l/@tinyhttp/app?style=flat-square)](npmjs.com/@tinyhttp/app) [![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)

<p>⚡ Tiny web framework as a replacement of Express</p>

</div>

**⚠ The project is in development. Please don't use in production.**

_**tinyhttp**_ is a modern [Express](https://expressjs.com)-like web framework for Node.js. It uses a bare minimum amount of dependencies trying to avoid legacy hell.

Here is a short list of most important features that tinyhttp has:

- ⚙ Full Express middleware support
- ↪ Async middleware support
- ☑ Native ESM and CommonJS support
- 🚀 No legacy dependencies, just the JavaScript itself
- 🔨 Types out of the box
- 📦 6x smaller than Express

To get started, visit [tinyhttp website](https://tinyhttp.v1rtl.site).

## Install

tinyhttp requires [Node.js 12.4.0 or newer](https://node.green/#ES2019). It is recommended to use [pnpm](https://pnpm.js.org/), although it isn't required.

```sh
# npm
npm i @tinyhttp/app
# pnpm
pnpm i @tinyhttp/app
# yarn
yarn add @tinyhttp/app
```

## Docs

You can see the documentation [here](https://tinyhttp.v1rtl.site/docs).

## Get Started

The app structure is quite similar to Express, except that you need to import `App` from `@tinyhttp/app` instead of default import from `express`.

```ts
import { App } from '@tinyhttp/app'
import logger from '@tinyhttp/logger'

const app = new App()

app
  .use(function someMiddleware(req, res, next) {
    console.log('Did a request')
    next()
  })
  .get('/', (_, res) => {
    res.send('<h1>Hello World</h1>')
  })
  .get('/page/:page/', (req, res) => {
    res.status(200).send(`You just opened ${req.params.page}`)
  })
  .use(logger())
  .listen(3000)
```

For more examples, check [examples](examples) folder.

## Middlewares

tinyhttp offers a list of premade middleware for common tasks.

Search and explore the full list at [middleware search page](https://tinyhttp.v1rtl.site/mw).

## Comparison

To compare tinyhttp with Express and Polka (another Express-like framework), see [COMPARISON.md](COMPARISON.md)

## Benchmarks

To see benchmark comparison between tinyhttp, polka and express, check [benchmark](benchmark) folder.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT © [v1rtl](https://v1rtl.site)

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://brailor.me/"><img src="https://avatars3.githubusercontent.com/u/17928339?v=4" width="100px;" alt=""/><br /><sub><b>Matt</b></sub></a><br /><a href="#plugin-BRA1L0R" title="Plugin/utility libraries">🔌</a></td>
    <td align="center"><a href="https://github.com/Betelgeuse1"><img src="https://avatars1.githubusercontent.com/u/45435407?v=4" width="100px;" alt=""/><br /><sub><b>Nasmevka</b></sub></a><br /><a href="https://github.com/talentlessguy/tinyhttp/commits?author=Betelgeuse1" title="Documentation">📖</a></td>
    <td align="center"><a href="http://elianiva.github.io"><img src="https://avatars0.githubusercontent.com/u/51877647?v=4" width="100px;" alt=""/><br /><sub><b>elianiva</b></sub></a><br /><a href="#example-elianiva" title="Examples">💡</a></td>
    <td align="center"><a href="https://nitropage.com"><img src="https://avatars0.githubusercontent.com/u/4012401?v=4" width="100px;" alt=""/><br /><sub><b>Katja Lutz</b></sub></a><br /><a href="#example-katywings" title="Examples">💡</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## Supporters 💰

These amazing people supported tinyhttp financially:

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://molefrog.com/"><img src="https://avatars3.githubusercontent.com/u/671276?v=4" width="100px;" alt=""/><br /><sub><b>molefrog</b></sub></td>
  </tr>
</table>
<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
