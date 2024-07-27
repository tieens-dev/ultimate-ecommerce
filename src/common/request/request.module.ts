import {
  DynamicModule,
  HttpStatus,
  Module,
  ValidationPipe
} from '@nestjs/common'
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ValidationError } from 'class-validator'

import { RequestTimeoutInterceptor } from '@common/request/interceptors/request.timeout.interceptor'
import { RequestValidationException } from '@common/request/exceptions/request.validation.exception'
import {
  DateGreaterThanConstraint,
  DateGreaterThanEqualConstraint
} from '@common/request/validations/request.date-greater-than.validation'
import {
  DateLessThanConstraint,
  DateLessThanEqualConstraint
} from '@common/request/validations/request.date-less-than.validation'
import {
  GreaterThanEqualOtherPropertyConstraint,
  GreaterThanOtherPropertyConstraint
} from '@common/request/validations/request.greater-than-other-property.validation'
import { IsPasswordConstraint } from '@common/request/validations/request.is-password.validation'
import {
  LessThanEqualOtherPropertyConstraint,
  LessThanOtherPropertyConstraint
} from '@common/request/validations/request.less-than-other-property.validation'
import { SafeStringConstraint } from '@common/request/validations/request.safe-string.validation'

@Module({})
export class RequestModule {
  static forRoot(): DynamicModule {
    return {
      module: RequestModule,
      controllers: [],
      providers: [
        {
          provide: APP_INTERCEPTOR,
          useClass: RequestTimeoutInterceptor
        },
        {
          provide: APP_PIPE,
          useFactory: () =>
            new ValidationPipe({
              transform: true,
              skipUndefinedProperties: true,
              forbidUnknownValues: true,
              errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
              exceptionFactory: async (errors: ValidationError[]) =>
                new RequestValidationException(errors)
            })
        },
        DateGreaterThanEqualConstraint,
        DateGreaterThanConstraint,
        DateLessThanEqualConstraint,
        DateLessThanConstraint,
        GreaterThanEqualOtherPropertyConstraint,
        GreaterThanOtherPropertyConstraint,
        IsPasswordConstraint,
        LessThanEqualOtherPropertyConstraint,
        LessThanOtherPropertyConstraint,
        SafeStringConstraint
      ],
      imports: []
    }
  }
}
