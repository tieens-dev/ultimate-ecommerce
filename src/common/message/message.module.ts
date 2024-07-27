import { DynamicModule, Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { I18nModule, HeaderResolver, I18nJsonLoader } from 'nestjs-i18n'
import * as path from 'path'

import { ENUM_MESSAGE_LANGUAGE } from '@app/constants/app.enum.constant'
import { MessageService } from './services/message.service'

@Global()
@Module({})
export class MessageModule {
  static forRoot(): DynamicModule {
    return {
      module: MessageModule,
      providers: [MessageService],
      exports: [MessageService],
      imports: [
        I18nModule.forRootAsync({
          useFactory: (configService: ConfigService) => ({
            fallbackLanguage: configService
              .get<string[]>('message.availableLanguage')
              .join(','),
            fallbacks: Object.values(ENUM_MESSAGE_LANGUAGE).reduce(
              (a, v) => ({ ...a, [`${v}-*`]: v }),
              {}
            ),
            loaderOptions: {
              path: path.join(__dirname, '../../../languages'),
              watch: true
            }
          }),
          loader: I18nJsonLoader,
          inject: [ConfigService],
          resolvers: [new HeaderResolver(['X-Custom-Language'])]
        })
      ],
      controllers: []
    }
  }
}
