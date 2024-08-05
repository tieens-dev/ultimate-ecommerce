import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { Logger } from '@zemd/nestjs-pino-logger'
import { ConfigService } from '@nestjs/config'
import { NestApplication } from '@nestjs/core'

import { writeFileSync } from 'fs'

export default async function (app: NestApplication) {
  const configService = app.get(ConfigService)
  const logger = app.get(Logger)

  const docName: string = configService.get<string>('docs.name')
  const docDesc: string = configService.get<string>('docs.description')
  const docVersion: string = configService.get<string>('docs.version')
  const docPrefix: string = configService.get<string>('docs.prefix')

  const documentBuild = new DocumentBuilder()
    .setTitle(docName)
    .setDescription(docDesc)
    .setVersion(docVersion)
    .addServer('/')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'accessToken'
    )
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'refreshToken'
    )
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'google'
    )
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'apple'
    )
    .addApiKey({ type: 'apiKey', in: 'header', name: 'x-api-key' }, 'xApiKey')
    .build()

  const document = SwaggerModule.createDocument(app, documentBuild, {
    deepScanRoutes: true
  })

  writeFileSync('swagger.json', JSON.stringify(document))
  SwaggerModule.setup(docPrefix, app, document, {
    jsonDocumentUrl: `${docPrefix}/json`,
    yamlDocumentUrl: `${docPrefix}/yaml`,
    explorer: true,
    customSiteTitle: docName,
    swaggerOptions: {
      docExpansion: 'none',
      persistAuthorization: true,
      displayOperationId: true,
      operationsSorter: 'method',
      tagsSorter: 'alpha',
      tryItOutEnabled: true,
      filter: true,
      deepLinking: true
    }
  })

  logger.log(`Docs will serve on ${docPrefix}`, 'AppAPISwagger')
}
