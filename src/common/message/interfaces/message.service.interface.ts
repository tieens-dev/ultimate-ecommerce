import { ValidationError } from '@nestjs/common'

import { ENUM_MESSAGE_LANGUAGE } from '@app/constants/app.enum.constant'
import {
  IMessageErrorOptions,
  IMessageSetOptions,
  IMessageValidationError,
  IMessageValidationImportError,
  IMessageValidationImportErrorParam
} from './message.interface'

export interface IMessageService {
  getAvailableLanguages(): ENUM_MESSAGE_LANGUAGE[]
  getLanguage(): ENUM_MESSAGE_LANGUAGE
  filterLanguage(customLanguage: string): string[]
  setMessage(path: string, options?: IMessageSetOptions): string
  setValidationMessage(
    errors: ValidationError[],
    options?: IMessageErrorOptions
  ): IMessageValidationError[]
  setValidationImportMessage(
    errors: IMessageValidationImportErrorParam[],
    options?: IMessageErrorOptions
  ): IMessageValidationImportError[]
}
