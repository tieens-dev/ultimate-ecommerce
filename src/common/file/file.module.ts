import { Module } from '@nestjs/common'

import { FileService } from '@common/file/services/file.service'

@Module({
  providers: [FileService],
  exports: [FileService],
  controllers: [],
  imports: []
})
export class FileModule {}
