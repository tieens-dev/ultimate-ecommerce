import { PipeTransform, Injectable } from '@nestjs/common'
import { Document } from 'mongoose'
import { DatabaseEntityAbstract } from '@common/database/abstracts/base/database.entity.abstract'

@Injectable()
export class RequestParsePlainObjectPipe<
  T extends Document,
  N extends DatabaseEntityAbstract
> implements PipeTransform
{
  async transform(value: T): Promise<N> {
    return value.toObject()
  }
}
