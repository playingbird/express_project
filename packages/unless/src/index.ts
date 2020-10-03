import type { Request, Response, NextFunction } from '@tinyhttp/app'

//Options for the middleware
export interface UnlessMiddlewareOptions {
  method?: string | string[] //methods to compare
  path?: string | RegExp | (string | RegExp | PathObject)[] //paths to compare
  ext?: string | string[] //last part of endpoint to compare
}

//Optional path object
interface PathObject {
  url: string
  methods: string[]
}

//Middleware interface
type Middleware = (req: Request, res: Response, next?: NextFunction) => any

//Unless custom function
export type CustomUnless = (req: Request) => boolean

//Convert single element to array of one element
function toArray(val: any | any[]): any[] {
  if (!Array.isArray(val) && val !== undefined) {
    return [val]
  }
  return val
}

//Check path parameter
function pathCheck(path: (string | RegExp | PathObject)[], url: string, method: string): boolean {
  let res = false
  for (const p of path) {
    if (typeof p === 'string') res = res || p === url
    else if (p instanceof RegExp) {
      const regexPath: RegExp = p as RegExp
      res = res || regexPath.test(url)
    } else {
      const objectPath: PathObject = p as PathObject
      res = res || (objectPath.url === url && objectPath.methods.indexOf(method) !== -1)
    }
    if (res) return res
  }
  return res
}

//Exported Unless Middleware
export function unless(middleware: Middleware, options: UnlessMiddlewareOptions | CustomUnless): (req: Request, res: Response, next: NextFunction) => any {
  let opts: UnlessMiddlewareOptions //options
  let custom: CustomUnless //function

  if (typeof options === 'object') {
    //unless(<middleware>, <options>);
    opts = options as UnlessMiddlewareOptions
  } else if (typeof options === 'function') {
    //unless(<middleware>, <function>);
    custom = options as CustomUnless
  }

  //Returned middleware with configuration
  return function result(req: Request, res: Response, next: NextFunction): any {
    if (custom === undefined && (opts === {} || opts === undefined)) next()
    if (custom === undefined) {
      const method: string[] = toArray(opts.method) //methods
      const path: string[] | RegExp[] = toArray(opts.path) //full path
      const ext: string[] = toArray(opts.ext) //last part of the endpoint

      const url: string[] = req.url.split('/') //splited endpoint array

      let skip = false //determine if should skip middleware

      if (method !== undefined) skip = skip || method.indexOf(req.method) !== -1
      if (ext !== undefined) skip = skip || ext.indexOf('/' + url[url.length - 1]) !== -1
      if (path !== undefined) skip = skip || pathCheck(path, req.url, req.method)

      if (skip) {
        next()
      } else {
        middleware(req, res, next)
      }
    } else {
      if (custom(req)) {
        next()
      } else {
        middleware(req, res, next)
      }
    }
  }
}
