import colors from 'colors'
import dayjs from 'dayjs'
import { IncomingMessage as Request, ServerResponse as Response, METHODS } from 'http'

export type LoggerProperties = Partial<{
  methods: string[]
  timestamp:
    | {
        format?: string
      }
    | boolean
}>

export const logger = (options: LoggerProperties = {}) => {
  const methods = options.methods || METHODS
  const timestamp = options.timestamp || false

  const logger = (req: Request, res: Response, next?: () => void) => {
    res.on('finish', () => {
      const { method, url } = req
      const { statusCode, statusMessage } = res

      if (method && methods.includes(method)) {
        const s = statusCode.toString()

        let status: string = s
        let msg: string = statusMessage

        let time = ''
        if (timestamp) {
          if (typeof timestamp !== 'boolean' && timestamp.format) {
            time += `${dayjs().format(timestamp.format).toString()} - `
          } else {
            time += `${dayjs().toString()} - `
          }
        }

        switch (s[0]) {
          case '2':
            status = colors.cyan.bold(s)
            msg = colors.cyan(msg)
            console.log(time + `${method} ${status} ${msg} ${url}`)
            break
          case '4':
            status = colors.red.bold(s)
            msg = colors.red(msg)
            console.log(time + `${method} ${status} ${msg} ${url}`)
            break
          case '5':
            status = colors.magenta.bold(s)
            msg = colors.magenta(msg)
            console.error(time + `${method} ${status} ${msg} ${url}`)
            break
        }
      }
    })

    next?.()
  }

  return logger
}
