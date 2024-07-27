import { Inject, Injectable, mixin, Type } from '@nestjs/common'
import { PipeTransform, Scope } from '@nestjs/common/interfaces'
import { REQUEST } from '@nestjs/core'

import { IRequestApp } from '@common/request/interfaces/request.interface'
import { PaginationService } from '@common/pagination/services/pagination.service'
import { IPaginationFilterEqualOptions } from '@common/pagination/interfaces/pagination.interface'

export function PaginationFilterEqualPipe(
  field: string,
  options?: IPaginationFilterEqualOptions
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinPaginationFilterEqualPipe implements PipeTransform {
    constructor(
      @Inject(REQUEST) protected readonly request: IRequestApp,
      private readonly paginationService: PaginationService
    ) {}

    async transform(value: string): Promise<Record<string, string | number>> {
      if (!value) {
        return undefined
      }

      if (options?.raw) {
        this.addToRequestInstance(value)
        return {
          [field]: value
        }
      }

      const finalValue: string | number = options?.isNumber
        ? Number.parseInt(value)
        : value.trim()

      this.addToRequestInstance(finalValue)
      return this.paginationService.filterEqual(field, finalValue)
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

  return mixin(MixinPaginationFilterEqualPipe)
}
