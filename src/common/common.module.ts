import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { LoggerModule } from '@zemd/nestjs-pino-logger'
import { LoggerOptions } from 'pino'

import configs from './configs'
import { DATABASE_CONNECTION_NAME } from '@common/database/constants/database.constant'
import { DatabaseModule } from '@common/database/database.module'
import { DatabaseService } from '@common/database/services/database.service'
import { MessageModule } from '@common/message/message.module'
import { HelpersModule } from '@common/helpers/helpers.module'
import { RequestModule } from '@common/request/request.module'
import { AuthModule } from '@common/auth/auth.module'
import { ApiKeyModule } from '@common/api-key/api-key.module'
import { PolicyModule } from '@common/policy/policy.module'

@Module({
  controllers: [],
  providers: [],
  imports: [
    //Configs
    ConfigModule.forRoot({
      load: configs,
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
      expandVariables: true
    }),
    //Mongoose
    MongooseModule.forRootAsync({
      connectionName: DATABASE_CONNECTION_NAME,
      imports: [DatabaseModule],
      inject: [DatabaseService],
      useFactory: (databaseService: DatabaseService) =>
        databaseService.createOptions()
    }),
    //Logger
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get<LoggerOptions>('pino')
    }),
    //Messages Module
    MessageModule.forRoot(),
    //Helpers Module
    HelpersModule.forRoot(),
    //Request Module
    RequestModule.forRoot(),
    //Policy Module
    PolicyModule.forRoot(),
    //Auth Module
    AuthModule.forRoot(),
    //ApiKey Module
    ApiKeyModule.forRoot()
  ]
})
export class CommonModule {}
