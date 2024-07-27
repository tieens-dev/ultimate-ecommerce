import { Inject, Injectable, mixin, Type } from '@nestjs/common'
import { PipeTransform, Scope } from '@nestjs/common/interfaces'
import { REQUEST } from '@nestjs/core'

import { IRequestApp } from '@common/request/interfaces/request.interface'
import { HelperArrayService } from '@common/helpers/services'
import { IPaginationFilterOptions } from '@common/pagination/interfaces/pagination.interface'
import { PaginationService } from '@common/pagination/services/pagination.service'

export function PaginationFilterInBooleanPipe(
  field: string,
  defaultValue: boolean[],
  options?: IPaginationFilterOptions
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinPaginationFilterInBooleanPipe implements PipeTransform {
    constructor(
      @Inject(REQUEST) protected readonly request: IRequestApp,
      private readonly paginationService: PaginationService,
      private readonly helperArrayService: HelperArrayService
    ) {}

    async transform(value: string): Promise<Record<string, any>> {
      if (options?.raw) {
        this.addToRequestInstance(value)
        return {
          [field]: value
        }
      }

      const finalValue: boolean[] = value
        ? this.helperArrayService.unique(
            value.split(',').map((val: string) => val === 'true')
          )
        : defaultValue

      if (finalValue.length === 2) {
        return undefined
      }

      this.addToRequestInstance(finalValue)
      return this.paginationService.filterEqual<boolean>(field, finalValue[0])
    }

    addToRequestInstance(value: any): void {
      this.request.__pagination = {
        ...this.request.__pagination,
        filters: this.request.__pagination?.filters
          ? {
              ...this.request.__pagination?.filters,
              [field]: value
            }
          : { [field]: value }
      }
    }
  }

  return mixin(MixinPaginationFilterInBooleanPipe)
}
