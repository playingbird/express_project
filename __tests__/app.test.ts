import supertest from 'supertest'
import http from 'http'
import { readFile } from 'fs/promises'
import { App } from '../packages/app/src'
import { renderFile as ejs } from 'ejs'
import type { Handler } from '../packages/router/src'
import type { Request, Response } from '../packages/app/src'

export const InitAppAndTest = (handler: Handler<Request, Response>, route?: string, method = 'get', settings = {}) => {
  const app = new App(settings)

  if (route) {
    app[method.toLowerCase()](route, handler)
  } else {
    app.use(handler)
  }

  const server = app.listen()

  const request = supertest(server)

  return { request, app }
}

describe('Testing App', () => {
  it('should launch a basic server', (done) => {
    const { request } = InitAppAndTest((_req, res) => void res.send('Hello world'))

    request.get('/').expect(200, 'Hello world', done)
  })
  it('should chain middleware', () => {
    const app = new App()

    app
      .use(function (_req, _res, next) {
        next()
      })
      .use((_req, _res, next) => {
        next()
      })

    expect(app.middleware.length).toBe(2)
  })
  it('app.locals are get and set', () => {
    const app = new App()

    app.locals.hello = 'world'

    expect(app.locals.hello).toBe('world')
  })
  it('Custom noMatchHandler works', (done) => {
    const app = new App({
      noMatchHandler: (req, res) => res.status(404).end(`Oopsie! Page ${req.url} is lost.`),
    })

    const server = app.listen()

    const request = supertest(server)

    request.get('/').expect(404, 'Oopsie! Page / is lost.', done)
  })
  it('Custom onError works', (done) => {
    const app = new App({
      onError: (err, req, res) => res.status(500).end(`Ouch, ${err} hurt me on ${req.url} page.`),
    })

    app.use((_req, _res, next) => {
      next('you')
    })

    const server = app.listen()

    const request = supertest(server)

    request.get('/').expect(500, 'Ouch, you hurt me on / page.', done)
  })

  it('App works with HTTP 1.1', (done) => {
    const app = new App()

    const server = http.createServer()

    server.on('request', (req, res) => app.handler(req, res))

    const request = supertest(server)

    request.get('/').expect(404, done)
  })
  it('req and res inherit properties from previous middlewares', (done) => {
    const app = new App()

    app
      .use((req, _res, next) => {
        req.body = { hello: 'world' }
        next()
      })
      .use((req, res) => {
        res.json(req.body)
      })

    const server = app.listen()

    const request = supertest(server)

    request.get('/').expect(200, { hello: 'world' }, done)
  })
  it('req and res inherit properties from previous middlewares asynchronously', (done) => {
    const app = new App()

    app
      .use(async (req, _res, next) => {
        req.body = await readFile(`${process.cwd()}/__tests__/fixtures/test.txt`)
        next()
      })
      .use((req, res) => {
        res.send(req.body.toString())
      })

    const server = app.listen()

    const request = supertest(server)

    request.get('/').expect(200, 'I am a text file.', done)
  })
})

describe('Template engines', () => {
  it('Works with ejs out of the box', (done) => {
    const app = new App()

    app.engine('ejs', ejs)

    app.use((_, res) => {
      res.render(
        'index.ejs',
        {
          name: 'EJS',
        },
        {
          viewsFolder: `${process.cwd()}/__tests__/fixtures/views`,
        }
      )
    })

    const server = app.listen()

    const request = supertest(server)

    request.get('/').expect(200, 'Hello from EJS!\n', done)
  })
})
