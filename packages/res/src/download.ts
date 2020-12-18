import { contentDisposition } from '@tinyhttp/content-disposition'
import { sendFile } from '@tinyhttp/send'
import { extname, resolve } from 'path'
import { IncomingMessage as I, ServerResponse as S } from 'http'
import { setContentType, setHeader } from './headers'
import type { SendFileOptions } from '@tinyhttp/send'

export type DownloadOptions = SendFileOptions &
  Partial<{
    headers: Record<string, any>
  }>

type Callback = (err?: any) => void

type Res = Pick<S, 'setHeader'> & NodeJS.WritableStream

export const download = <Response extends Res = Res>(res: Response) => (
  path: string,
  filename?: string | Callback,
  options?: DownloadOptions | Callback,
  cb?: Callback
): Response => {
  let done = cb
  let name = filename as string
  let opts = (options || null) as DownloadOptions

  // support function as second or third arg
  if (typeof filename === 'function') {
    done = filename
    name = null
  } else if (typeof options === 'function') {
    done = options
    opts = null
  }

  // set Content-Disposition when file is sent
  const headers = {
    'Content-Disposition': contentDisposition(name || path)
  }

  // merge user-provided headers
  if (opts && opts.headers) {
    for (const key of Object.keys(opts.headers)) {
      if (key.toLowerCase() !== 'content-disposition') headers[key] = opts.headers[key]
    }
  }

  // merge user-provided options
  opts = Object.create(opts)
  opts.headers = headers

  // Resolve the full path for sendFile
  const fullPath = resolve(path)

  const noop = () => undefined

  // send file
  return sendFile(res)(fullPath, opts, done || noop)
}

export const attachment = <Response extends Pick<S, 'getHeader' | 'setHeader'> = Pick<S, 'getHeader' | 'setHeader'>>(
  res: Response
) => (filename?: string): Response => {
  if (filename) setContentType(res)(extname(filename))

  setHeader(res)('Content-Disposition', contentDisposition(filename))

  return res
}
