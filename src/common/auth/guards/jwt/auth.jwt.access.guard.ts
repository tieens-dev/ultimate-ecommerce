import { AuthGuard } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'

import { ENUM_AUTH_STATUS_CODE_ERROR } from '@common/auth/constants/auth.status-code.constant'

@Injectable()
export class AuthJwtAccessGuard extends AuthGuard('jwtAccess') {
  handleRequest<TUser = any>(err: Error, user: TUser, info: Error): TUser {
    if (err || !user) {
      throw new UnauthorizedException({
        statusCode: ENUM_AUTH_STATUS_CODE_ERROR.JWT_ACCESS_TOKEN_ERROR,
        message: 'auth.error.accessTokenUnauthorized',
        _error: err ? err.message : info.message
      })
    }

    return user
  }
}
