import { NestApplication, NestFactory } from '@nestjs/core'
import { VersioningType } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Logger, PINO_LOGGER_INSTANCE } from '@zemd/nestjs-pino-logger'
import pinoHttp from 'pino-http'
import type { Options } from 'pino-http'
import { useContainer, validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'

import { MessageService } from '@common/message/services/message.service'
import { AppEnvDto } from '@app/dtos/app.env.dto'
import { AppModule } from '@app/app.module'
import swaggerInit from 'src/swagger'

async function bootstrap() {
  const app: NestApplication = await NestFactory.create(AppModule, {
    bufferLogs: true
  })
  const configService = app.get(ConfigService)
  const databaseUri: string = configService.get<string>('database.uri')
  const env: string = configService.get<string>('app.env')
  const timezone: string = configService.get<string>('app.timezone')
  const host: string = configService.get<string>('app.http.host')
  const port: number = configService.get<number>('app.http.port')
  const globalPrefix: string = configService.get<string>('app.globalPrefix')
  const versioningPrefix: string = configService.get<string>(
    'app.urlVersion.prefix'
  )
  const version: string = configService.get<string>('app.urlVersion.version')

  // enable
  const httpEnable: boolean = configService.get<boolean>('app.http.enable')
  const versionEnable: string = configService.get<string>(
    'app.urlVersion.enable'
  )
  const jobEnable: boolean = configService.get<boolean>('app.jobEnable')

  // Logger
  const logger = app.get(Logger)
  app.useLogger(logger)

  app.use(
    pinoHttp({
      ...configService.get<Options>('pino-http'),
      logger: app.get(PINO_LOGGER_INSTANCE)
    })
  )

  process.env.NODE_ENV = env
  process.env.TZ = timezone

  // Global
  app.setGlobalPrefix(globalPrefix)

  // For Custom Validation
  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  // Versioning
  if (versionEnable) {
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: version,
      prefix: versioningPrefix
    })
  }

  // Swagger
  await swaggerInit(app)

  // Listen
  await app.listen(port, host)

  // Validate Env
  const classEnv = plainToInstance(AppEnvDto, process.env)
  const errors = await validate(classEnv)
  if (errors.length > 0) {
    const messageService = app.get(MessageService)
    const errorsMessage = messageService.setValidationMessage(errors)
    logger.error(errorsMessage, 'AppAPI')
    throw new Error('Env Variable Invalid')
  }

  logger.log(`Job is ${jobEnable}`, 'AppAPI')
  logger.log(
    `Http is ${httpEnable}, ${
      httpEnable ? 'routes registered' : 'no routes registered'
    }`,
    'AppAPI'
  )
  logger.log(`Http versioning is ${versionEnable}`, 'AppAPI')

  logger.log(`Http Server running on ${await app.getUrl()}`, 'AppAPI')
  logger.log(`Database uri ${databaseUri}`, 'AppAPI')
}
bootstrap()
