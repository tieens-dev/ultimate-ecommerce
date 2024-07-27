import { registerAs } from '@nestjs/config'
import bytes from 'bytes'
import ms from 'ms'

export default registerAs(
  'middleware',
  (): Record<string, any> => ({
    body: {
      json: {
        maxFileSize: bytes('100kb')
      },
      raw: {
        maxFileSize: bytes('100kb')
      },
      text: {
        maxFileSize: bytes('100kb')
      },
      urlencoded: {
        maxFileSize: bytes('100kb')
      }
    },
    timeout: ms('30s'), // 30s based on ms module
    cors: {
      allowMethod: ['GET', 'DELETE', 'PUT', 'PATCH', 'POST'],
      allowOrigin: '*', // allow all origin
      // allowOrigin: [/example\.com(\:\d{1,4})?$/], // allow all subdomain, and all port
      // allowOrigin: [/example\.com$/], // allow all subdomain without port
      allowHeader: [
        'Accept',
        'Accept-Language',
        'Content-Language',
        'Content-Type',
        'Origin',
        'Authorization',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers',
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Credentials',
        'Access-Control-Expose-Headers',
        'Access-Control-Max-Age',
        'Referer',
        'Host',
        'X-Requested-With',
        'X-Custom-Language',
        'X-Timestamp',
        'X-API-Key',
        'X-Timezone',
        'X-Request-Id',
        'X-Version',
        'X-Repo-Version',
        'X-Response-Time',
        'User-Agent'
      ]
    },
    throttle: {
      ttl: ms('500'), // 0.5 secs
      limit: 10 // max request per reset time
    }
  })
)
