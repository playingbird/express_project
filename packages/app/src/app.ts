import { createServer, STATUS_CODES } from 'http'
import rg from 'regexparam'
import {
  Request,
  getQueryParams,
  getURLParams,
  getRouteFromApp,
  getProtocol,
  getHeader,
  getRangeFromHeader,
  checkIfXMLHttpRequest,
  getHostname
} from './request'
import { Response, send, json, status, setCookie, clearCookie, setHeader } from './response'
import { notFound } from './notFound'

export const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'HEAD']

export type Handler = (req: Request, res: Response, next?: () => void) => void | Promise<void>

export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'HEAD' | string

export const onError = (err: any, _req: Request, res: Response, _next: () => void) => {
  let code = (res.statusCode = err.code || err.status || 500)
  if (typeof err === 'string' || Buffer.isBuffer(err)) res.end(err)
  else res.end(err.message || STATUS_CODES[code])
}

export interface Middleware {
  method?: Method
  handler: Handler
  url?: string
}

type MethodHandler = {
  url: string | Handler
  handler?: Handler
}

const createHandler = ({
  url,
  handler,
  method
}: MethodHandler & {
  method: Method
}) => ({
  method,
  handler: handler || (url as Handler),
  url: typeof url === 'string' ? url : '*'
})

export class App {
  routes: Middleware[]
  middleware: Middleware[]
  noMatchHandler: Handler
  constructor(noMatchHandler: Handler = notFound()) {
    this.routes = []
    this.middleware = []
    this.noMatchHandler = noMatchHandler
  }

  get(url: string | Handler, handler?: Handler) {
    this.routes.push(createHandler({ url, handler, method: 'GET' }))
    return this
  }
  post(url: string | Handler, handler?: Handler) {
    this.routes.push(createHandler({ url, handler, method: 'POST' }))
    return this
  }
  put(url: string | Handler, handler?: Handler) {
    this.routes.push(createHandler({ url, handler, method: 'PUT' }))
    return this
  }
  patch(url: string | Handler, handler?: Handler) {
    this.routes.push(createHandler({ url, handler, method: 'PATCH' }))
    return this
  }
  head(url: string | Handler, handler?: Handler) {
    this.routes.push(createHandler({ url, handler, method: 'HEAD' }))
    return this
  }
  all(url: string | Handler, handler?: Handler) {
    for (const method of METHODS) {
      this.routes.push(createHandler({ url, handler, method }))
    }
    return this
  }
  use(handler: Handler) {
    this.middleware.push({
      handler
    })
    return this
  }
  handle(req: Request, res: Response) {
    /// Define extensions

    /*
    Request extensions
    */

    req.app = this

    const proto = getProtocol(req)
    const secure = proto === 'https'

    req.protocol = proto
    req.secure = secure
    req.connection = Object.assign(req.socket, {
      encrypted: secure
    })

    req.query = getQueryParams(req.url)

    req.get = getHeader(req)
    req.range = getRangeFromHeader(req)

    req.xhr = checkIfXMLHttpRequest(req)

    req.hostname = getHostname(req)

    /*
    Response extensions
    */
    res.app = this
    res.header = res.set = setHeader(req, res)
    res.send = send(req, res)
    res.json = json(req, res)
    res.status = status(req, res)

    res.cookie = setCookie(req, res)
    res.clearCookie = clearCookie(req, res)

    for (const route of this.routes) {
      const { url, method, handler } = route

      if (res.writableEnded) {
        continue
      } else {
        if (req.method === method) {
          if (url && req.url && rg(url).pattern.test(req.url)) {
            req.params = getURLParams(req.url, url)
            req.route = getRouteFromApp(this, handler)

            res.statusCode = 200

            handler(req, res)
          }
        }
      }
    }

    let middleware: Middleware[] = this.middleware.filter(m => m.handler.name !== 'logger')

    middleware.push({ handler: this.noMatchHandler })

    const logger = this.middleware.find(m => m.handler.name === 'logger')

    if (logger) middleware.push(logger)

    middleware.map(({ handler }) => {
      handler(req, res)
    })
  }

  listen(
    port?: number,
    cb = () => console.log(`Started on http://${host}:${port}`),
    host: string = 'localhost',
    backlog?: number
  ) {
    // @ts-ignore
    const server = createServer((req: Request, res: Response) => {
      this.handle(req, res)
    })

    return server.listen(port, host, backlog, cb)
  }
}
