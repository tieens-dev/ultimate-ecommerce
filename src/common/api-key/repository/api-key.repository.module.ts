import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { DATABASE_CONNECTION_NAME } from '@common/database/constants/database.constant'
import {
  ApiKeyEntity,
  ApiKeySchema
} from '@common/api-key/repository/entities/api-key.entity'
import { ApiKeyRepository } from '@common/api-key/repository/repositories/api-key.repository'

@Module({
  providers: [ApiKeyRepository],
  exports: [ApiKeyRepository],
  controllers: [],
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: ApiKeyEntity.name,
          schema: ApiKeySchema
        }
      ],
      DATABASE_CONNECTION_NAME
    )
  ]
})
export class ApiKeyRepositoryModule {}
