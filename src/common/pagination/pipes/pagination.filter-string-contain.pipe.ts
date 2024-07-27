import { Inject, Injectable, mixin, Type } from '@nestjs/common'
import { PipeTransform, Scope } from '@nestjs/common/interfaces'
import { REQUEST } from '@nestjs/core'

import { IRequestApp } from '@common/request/interfaces/request.interface'
import { PaginationService } from '@common/pagination/services/pagination.service'
import { IPaginationFilterOptions } from '@common/pagination/interfaces/pagination.interface'

export function PaginationFilterStringContainPipe(
  field: string,
  options?: IPaginationFilterOptions
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinPaginationFilterContainPipe implements PipeTransform {
    constructor(
      @Inject(REQUEST) protected readonly request: IRequestApp,
      private readonly paginationService: PaginationService
    ) {}

    async transform(value: string): Promise<Record<string, any>> {
      if (!value) {
        return undefined
      }

      if (options?.raw) {
        this.addToRequestInstance(value)
        return {
          [field]: value
        }
      }

      value = value.trim()

      this.addToRequestInstance(value)
      return this.paginationService.filterContain(field, value)
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

  return mixin(MixinPaginationFilterContainPipe)
}
