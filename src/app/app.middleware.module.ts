import {
  LogLevel,
  MiddlewareConsumer,
  Module,
  NestModule
} from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_FILTER, APP_GUARD } from '@nestjs/core'
import {
  ThrottlerGuard,
  ThrottlerModule,
  ThrottlerModuleOptions
} from '@nestjs/throttler'
import { SentryModule } from '@ntegral/nestjs-sentry'

import { ENUM_APP_ENVIRONMENT } from '@app/constants/app.enum.constant'
import {
  CorsMiddleware,
  JsonBodyParserMiddleware,
  RawBodyParserMiddleware,
  TextBodyParserMiddleware,
  UrlencodedBodyParserMiddleware,
  MessageCustomLanguageMiddleware,
  HelmetMiddleware,
  ResponseTimeMiddleware,
  UrlVersionMiddleware
} from '@app/middlewares'
import {
  AppHttpFilter,
  AppGeneralFilter,
  AppValidationFilter
} from '@app/filters'

@Module({
  controllers: [],
  exports: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: APP_FILTER,
      useClass: AppGeneralFilter
    },
    {
      provide: APP_FILTER,
      useClass: AppValidationFilter
    },
    // {
    //   provide: APP_FILTER,
    //   useClass: AppValidationImportFilter
    // },
    {
      provide: APP_FILTER,
      useClass: AppHttpFilter
    }
  ],
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): ThrottlerModuleOptions => ({
        throttlers: [
          {
            ttl: config.get('middleware.throttle.ttl'),
            limit: config.get('middleware.throttle.limit')
          }
        ]
      })
    }),
    SentryModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        dsn: configService.get('debug.sentry.dsn'),
        debug: false,
        environment: configService.get<ENUM_APP_ENVIRONMENT>('app.env'),
        release: configService.get<string>('app.repoVersion'),
        logLevels: configService.get<LogLevel[]>(
          'debug.sentry.logLevels.exception'
        ),
        close: {
          enabled: true,
          timeout: configService.get<number>('debug.sentry.timeout')
        }
      }),
      inject: [ConfigService]
    })
  ]
})
export class AppMiddlewareModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(
        HelmetMiddleware,
        JsonBodyParserMiddleware,
        TextBodyParserMiddleware,
        RawBodyParserMiddleware,
        UrlencodedBodyParserMiddleware,
        CorsMiddleware,
        UrlVersionMiddleware,
        ResponseTimeMiddleware,
        MessageCustomLanguageMiddleware
      )
      .forRoutes('*')
  }
}
