import { DynamicModule, Module } from '@nestjs/common'

import { AuthService } from '@common/auth/services/auth.service'
import { AuthJwtAccessStrategy } from '@common/auth/guards/jwt/strategies/auth.jwt.access.strategy'
import { AuthJwtRefreshStrategy } from '@common/auth/guards/jwt/strategies/auth.jwt.refresh.strategy'

@Module({
  providers: [AuthService],
  exports: [AuthService],
  controllers: [],
  imports: []
})
export class AuthModule {
  static forRoot(): DynamicModule {
    return {
      module: AuthModule,
      providers: [AuthJwtAccessStrategy, AuthJwtRefreshStrategy],
      exports: [],
      controllers: [],
      imports: []
    }
  }
}
