import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { IRequestApp } from '@common/request/interfaces/request.interface'
import { POLICY_ROLE_META_KEY } from '@common/policy/constants/policy.constant'
import { ENUM_POLICY_ROLE_TYPE } from '@common/policy/constants/policy.enum.constant'
import { ENUM_POLICY_STATUS_CODE_ERROR } from '@common/policy/constants/policy.status-code.constant'

@Injectable()
export class PolicyRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const role =
      this.reflector.get<ENUM_POLICY_ROLE_TYPE>(
        POLICY_ROLE_META_KEY,
        context.getHandler()
      ) || []

    const { user } = context.switchToHttp().getRequest<IRequestApp>()
    const { type } = user

    if (role?.length === 0 || type === ENUM_POLICY_ROLE_TYPE.SUPER_ADMIN) {
      return true
    }

    if (!role.includes(type)) {
      throw new ForbiddenException({
        statusCode: ENUM_POLICY_STATUS_CODE_ERROR.ROLE_FORBIDDEN_ERROR,
        message: 'policy.error.roleForbidden'
      })
    }

    return true
  }
}
