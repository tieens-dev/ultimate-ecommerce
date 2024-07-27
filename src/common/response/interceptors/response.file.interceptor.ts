import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  StreamableFile
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { HttpArgumentsHost } from '@nestjs/common/interfaces'
import { Response } from 'express'
import { Reflector } from '@nestjs/core'

import {
  RESPONSE_FILE_EXCEL_PASSWORD_META_KEY,
  RESPONSE_FILE_EXCEL_TYPE_META_KEY
} from '@common/response/constants/response.constant'
import { IResponseFileExcel } from '@common/response/interfaces/response.interface'
import { HelperDateService } from '@common/helpers/services'
import { ENUM_HELPER_FILE_EXCEL_TYPE } from '@common/helpers/constants/helper.enum.constant'
import { ENUM_FILE_MIME } from '@common/file/constants/file.enum.constant'
import { FileService } from '@common/file/services/file.service'

@Injectable()
export class ResponseFileExcelInterceptor
  implements NestInterceptor<Promise<any>>
{
  constructor(
    private readonly reflector: Reflector,
    private readonly fileService: FileService,
    private readonly helperDateService: HelperDateService
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<Promise<StreamableFile>> {
    if (context.getType() === 'http') {
      return next.handle().pipe(
        map(async (res: Promise<IResponseFileExcel>) => {
          const ctx: HttpArgumentsHost = context.switchToHttp()
          const response: Response = ctx.getResponse()

          const type: ENUM_HELPER_FILE_EXCEL_TYPE =
            this.reflector.get<ENUM_HELPER_FILE_EXCEL_TYPE>(
              RESPONSE_FILE_EXCEL_TYPE_META_KEY,
              context.getHandler()
            )

          const password: string = this.reflector.get<string>(
            RESPONSE_FILE_EXCEL_PASSWORD_META_KEY,
            context.getHandler()
          )

          // set default response
          const responseData = (await res) as IResponseFileExcel

          if (!responseData) {
            throw new Error(
              'ResponseFileExcel must instanceof IResponseFileExcel'
            )
          } else if (!responseData.data || !Array.isArray(responseData.data)) {
            throw new Error('Field data must in array')
          }

          if (type === ENUM_HELPER_FILE_EXCEL_TYPE.XLSX) {
            // create file
            const file: Buffer = this.fileService.writeExcel(
              responseData.data,
              {
                password
              }
            )

            // set headers
            const timestamp = this.helperDateService.createTimestamp()
            response
              .setHeader('Content-Type', ENUM_FILE_MIME.XLSX)
              .setHeader(
                'Content-Disposition',
                `attachment; filename=export-${timestamp}.${type.toLowerCase()}`
              )
              .setHeader('Content-Length', file.length)

            return new StreamableFile(file)
          }

          // create file
          const file: Buffer = this.fileService.writeCsv(responseData.data[0])

          // set headers
          const timestamp = this.helperDateService.createTimestamp()
          response
            .setHeader('Content-Type', ENUM_FILE_MIME.CSV)
            .setHeader(
              'Content-Disposition',
              `attachment; filename=export-${timestamp}.${type.toLowerCase()}`
            )
            .setHeader('Content-Length', file.length)

          return new StreamableFile(file)
        })
      )
    }

    return next.handle()
  }
}
