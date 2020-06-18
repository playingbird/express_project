import { Handler, METHODS, Request, Response } from '@tinyhttp/app'

const cors = ({ host = '*', methods = METHODS, headers = ['Origin', 'X-Requested-With', 'Content-Type'] }): Handler => {
  const prefix = 'Access-Control-Allow'

  return (_: Request, res: Response) => {
    res.setHeader(`${prefix}-Origin`, host)
    res.setHeader(`${prefix}-Headers`, headers.join(', '))
    res.setHeader(`${prefix}-Methods`, methods.join(', '))
  }
}

export default cors
