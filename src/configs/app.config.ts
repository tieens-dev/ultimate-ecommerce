import { registerAs } from '@nestjs/config'
import { version } from 'package.json'
import {
  ENUM_APP_ENVIRONMENT,
  ENUM_APP_TIMEZONE
} from '@app/constants/app.enum.constant'

export default registerAs(
  'app',
  (): Record<string, any> => ({
    name: process.env.APP_NAME ?? 'AppAPI',
    env: process.env.APP_ENV ?? ENUM_APP_ENVIRONMENT.DEVELOPMENT,
    timezone: process.env.APP_TIMEZONE ?? ENUM_APP_TIMEZONE.ASIA_SINGAPORE,
    repoVersion: version,
    globalPrefix: process.env.APP_PREFIX ?? '/api',

    debug: process.env.APP_DEBUG === 'true',

    jobEnable: process.env.JOB_ENABLE === 'true',

    http: {
      enable: process.env.HTTP_ENABLE === 'true',
      host: process.env.HTTP_HOST ?? 'localhost',
      port: process.env.HTTP_PORT
        ? Number.parseInt(process.env.HTTP_PORT)
        : 3000
    },
    urlVersion: {
      enable: process.env.URL_VERSION_ENABLE === 'true',
      prefix: 'v',
      version: process.env.URL_VERSION ?? '1'
    }
  })
)
