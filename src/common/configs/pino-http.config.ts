import { registerAs } from '@nestjs/config'
import { Options } from 'pino-http'
import * as crypto from 'node:crypto'

export default registerAs('pino-http', (): Partial<Options> => {
  return {
    level: process.env.LOG_LEVEL ?? 'verbose',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    genReqId: (req, _) => {
      // this is not required
      if (req.id) {
        return req.id
      }
      return crypto.randomUUID()
    },
    customProps: () => ({
      // by default there is no "context" provided inside the middleware, so we need to add it manually
      context: 'http'
    }),
    // pino-http types don't accept custom log levels, so we need to use ts-ignore here,
    // if you want to use one log level for all requests, just use `useLevel` option.
    // @ts-expect-error Custom
    customLogLevel: function (_, res, err) {
      if (res.statusCode >= 400 && res.statusCode < 500) {
        return 'warn'
      } else if (res.statusCode >= 500 || err) {
        return 'error'
      } else if (res.statusCode >= 300 && res.statusCode < 400) {
        return 'verbose'
      }
      return 'log'
    }
  }
})
