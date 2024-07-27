import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger
} from '@nestjs/common'
import { HttpArgumentsHost } from '@nestjs/common/interfaces'
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'

import { IAppException } from '@app/interfaces/app.interface'
import { IRequestApp } from '@common/request/interfaces/request.interface'
import { IMessageValidationError } from '@common/message/interfaces/message.interface'
import { RequestValidationException } from '@common/request/exceptions/request.validation.exception'
import { MessageService } from '@common/message/services/message.service'
import { HelperDateService } from '@common/helpers/services'
import { ResponseMetadataDto } from '@common/response/dtos/response.dto'

@Catch(RequestValidationException)
export class AppValidationFilter implements ExceptionFilter {
  private readonly debug: boolean
  private readonly logger = new Logger(AppValidationFilter.name)

  constructor(
    private readonly messageService: MessageService,
    private readonly configService: ConfigService,
    private readonly helperDateService: HelperDateService
  ) {
    this.debug = this.configService.get<boolean>('app.debug')
  }

  async catch(
    exception: RequestValidationException,
    host: ArgumentsHost
  ): Promise<void> {
    const ctx: HttpArgumentsHost = host.switchToHttp()
    const response: Response = ctx.getResponse<Response>()
    const request: IRequestApp = ctx.getRequest<IRequestApp>()

    if (this.debug) {
      this.logger.error(exception)
    }

    // set default
    const responseException = exception.getResponse() as IAppException
    const statusHttp: HttpStatus = exception.getStatus()
    const statusCode = responseException.statusCode

    // metadata
    const xLanguage: string =
      request.__language ?? this.messageService.getLanguage()
    const xTimestamp = this.helperDateService.createTimestamp()
    const xTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const xVersion =
      request.__version ??
      this.configService.get<string>('app.urlVersion.version')
    const xRepoVersion = this.configService.get<string>('app.repoVersion')
    const metadata: ResponseMetadataDto = {
      language: xLanguage,
      timestamp: xTimestamp,
      timezone: xTimezone,
      path: request.path,
      version: xVersion,
      repoVersion: xRepoVersion
    }

    // set response
    const message = this.messageService.setMessage(exception.message, {
      customLanguage: xLanguage
    })
    const errors: IMessageValidationError[] =
      this.messageService.setValidationMessage(responseException.errors, {
        customLanguage: xLanguage
      })

    const responseBody: IAppException = {
      statusCode,
      message,
      errors,
      _metadata: metadata
    }

    response
      .setHeader('X-Custom-Language', xLanguage)
      .setHeader('X-Timestamp', xTimestamp)
      .setHeader('X-Timezone', xTimezone)
      .setHeader('X-Version', xVersion)
      .setHeader('X-Repo-Version', xRepoVersion)
      .status(statusHttp)
      .json(responseBody)

    return
  }
}
