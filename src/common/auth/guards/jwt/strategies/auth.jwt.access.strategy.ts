import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { AuthJwtAccessPayloadDto } from '@common/auth/dtos/jwt/auth.jwt.access-payload.dto'

@Injectable()
export class AuthJwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwtAccess'
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme(
        configService.get<string>('auth.jwt.prefixAuthorization')
      ),
      ignoreExpiration: false,
      jsonWebTokenOptions: {
        ignoreNotBefore: true,
        audience: configService.get<string>('auth.jwt.audience'),
        issuer: configService.get<string>('auth.jwt.issuer'),
        subject: configService.get<string>('auth.jwt.subject')
      },
      secretOrKey: configService.get<string>('auth.jwt.accessToken.secretKey')
    })
  }

  async validate(
    data: AuthJwtAccessPayloadDto
  ): Promise<AuthJwtAccessPayloadDto> {
    return data
  }
}
