import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ValidationError } from 'class-validator'
import { I18nService } from 'nestjs-i18n'

import { ENUM_MESSAGE_LANGUAGE } from '@app/constants/app.enum.constant'
import { IMessageService } from '@common/message/interfaces/message.service.interface'
import {
  IMessageErrorOptions,
  IMessageSetOptions,
  IMessageValidationError,
  IMessageValidationImportError,
  IMessageValidationImportErrorParam
} from '@common/message/interfaces/message.interface'
import { HelperArrayService } from '@common/helpers/services'

@Injectable()
export class MessageService implements IMessageService {
  private readonly defaultLanguage: ENUM_MESSAGE_LANGUAGE
  private readonly availableLanguage: ENUM_MESSAGE_LANGUAGE[]
  private readonly debug: boolean

  constructor(
    private readonly i18n: I18nService,
    private readonly configService: ConfigService,
    private readonly helperArrayService: HelperArrayService
  ) {
    this.defaultLanguage =
      this.configService.get<ENUM_MESSAGE_LANGUAGE>('message.language')
    this.availableLanguage = this.configService.get<ENUM_MESSAGE_LANGUAGE[]>(
      'message.availableLanguage'
    )
    this.debug = this.configService.get<boolean>('app.debug')
  }

  getAvailableLanguages(): ENUM_MESSAGE_LANGUAGE[] {
    return this.availableLanguage
  }

  getLanguage(): ENUM_MESSAGE_LANGUAGE {
    return this.defaultLanguage
  }

  //! Filter message base on available language
  filterLanguage(customLanguage: string): string[] {
    return this.helperArrayService.getIntersection(
      [customLanguage],
      this.availableLanguage
    )
  }

  //! set message by path  base on language
  setMessage(path: string, options?: IMessageSetOptions): string {
    const language: string = options?.customLanguage
      ? this.filterLanguage(options.customLanguage)[0]
      : this.defaultLanguage

    return this.i18n.translate(path, {
      lang: language,
      args: options?.properties,
      debug: this.debug
    }) as any
  }

  setValidationMessage(
    errors: ValidationError[],
    options?: IMessageErrorOptions
  ): IMessageValidationError[] {
    const messages: IMessageValidationError[] = []
    for (const error of errors) {
      const property = error.property ?? 'unknown'
      const constraints: string[] = Object.keys(error.constraints ?? [])

      for (const constraint of constraints) {
        const message = this.setMessage(`request.${constraint}`, {
          customLanguage: options?.customLanguage,
          properties: {
            property,
            value: error.value
          }
        })

        messages.push({
          property,
          message: message
        })
      }
    }

    return messages
  }

  setValidationImportMessage(
    errors: IMessageValidationImportErrorParam[],
    options?: IMessageErrorOptions
  ): IMessageValidationImportError[] {
    return errors.map((val) => ({
      row: val.row,
      sheetName: val.sheetName,
      errors: this.setValidationMessage(val.error, options)
    }))
  }
}
