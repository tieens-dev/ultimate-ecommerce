import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Optional,
  InternalServerErrorException,
  Logger
} from '@nestjs/common'
import { Response } from 'express'
import { ConfigService } from '@nestjs/config'
import { HttpAdapterHost } from '@nestjs/core'
import { HttpArgumentsHost } from '@nestjs/common/interfaces'
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry'

import { IRequestApp } from '@common/request/interfaces/request.interface'
import { MessageService } from '@common/message/services/message.service'
import { HelperDateService } from '@common/helpers/services'
import { ResponseMetadataDto } from '@common/response/dtos/response.dto'
import { IAppException } from '@app/interfaces/app.interface'
import { RequestValidationException } from '@common/request/exceptions/request.validation.exception'

@Catch()
export class AppGeneralFilter implements ExceptionFilter {
  private readonly debug: boolean
  private readonly logger = new Logger(AppGeneralFilter.name)

  constructor(
    @Optional()
    @InjectSentry()
    private readonly sentryService: SentryService,
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly messageService: MessageService,
    private readonly configService: ConfigService,
    private readonly helperDateService: HelperDateService
  ) {
    this.debug = this.configService.get<boolean>('app.debug')
  }

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const { httpAdapter } = this.httpAdapterHost

    const ctx: HttpArgumentsHost = host.switchToHttp()
    const response: Response = ctx.getResponse<Response>()
    const request: IRequestApp = ctx.getRequest<IRequestApp>()

    if (this.debug) {
      this.logger.error(exception)
    }

    // sentry
    this.sendToSentry(exception)

    if (exception instanceof HttpException) {
      const response = exception.getResponse()
      const statusHttp = exception.getStatus()

      httpAdapter.reply(ctx.getResponse(), response, statusHttp)
      return
    }

    // set default
    const statusHttp: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR
    const messagePath = `http.${statusHttp}`
    const statusCode = HttpStatus.INTERNAL_SERVER_ERROR

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

    const message: string = this.messageService.setMessage(messagePath, {
      customLanguage: xLanguage
    })

    const responseBody: IAppException = {
      statusCode,
      message,
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

  sendToSentry(exception: unknown): void {
    if (
      (exception instanceof HttpException &&
        !(exception instanceof InternalServerErrorException)) ||
      exception instanceof RequestValidationException
      // || exception instanceof FileImportException
    ) {
      return
    }

    try {
      this.sentryService.instance().captureException(exception)
    } catch (err: unknown) {}

    return
  }
}
