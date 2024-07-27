import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common'
import {
  POLICY_ABILITY_META_KEY,
  POLICY_ROLE_META_KEY
} from '@common/policy/constants/policy.constant'
import { ENUM_POLICY_ROLE_TYPE } from '@common/policy/constants/policy.enum.constant'
import { IPolicyAbility } from '@common/policy/interfaces/policy.interface'
import { PolicyRoleGuard } from '@common/policy/guards/policy.role.guard'
import { PolicyAbilityGuard } from '@common/policy/guards/policy.ability.guard'

export function PolicyAbilityProtected(
  ...handlers: IPolicyAbility[]
): MethodDecorator {
  return applyDecorators(
    UseGuards(PolicyAbilityGuard),
    SetMetadata(POLICY_ABILITY_META_KEY, handlers)
  )
}

export function PolicyRoleProtected(
  ...roles: ENUM_POLICY_ROLE_TYPE[]
): MethodDecorator {
  return applyDecorators(
    UseGuards(PolicyRoleGuard),
    SetMetadata(POLICY_ROLE_META_KEY, roles)
  )
}
