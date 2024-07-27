import { Inject, Injectable, mixin, Type } from '@nestjs/common'
import { PipeTransform, Scope } from '@nestjs/common/interfaces'
import { REQUEST } from '@nestjs/core'

import { IRequestApp } from '@common/request/interfaces/request.interface'
import { IPaginationFilterOptions } from '@common/pagination/interfaces/pagination.interface'
import { PaginationService } from '@common/pagination/services/pagination.service'

export function PaginationFilterInEnumPipe<T>(
  field: string,
  defaultValue: T,
  defaultEnum: Record<string, any>,
  options?: IPaginationFilterOptions
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinPaginationFilterInEnumPipe implements PipeTransform {
    constructor(
      @Inject(REQUEST) protected readonly request: IRequestApp,
      private readonly paginationService: PaginationService
    ) {}

    async transform(value: string): Promise<Record<string, any>> {
      if (options?.raw) {
        this.addToRequestInstance(value)
        return {
          [field]: value
        }
      }

      const finalValue: T[] = value
        ? (value
            .split(',')
            .map((val: string) => defaultEnum[val])
            .filter((val: string) => val) as T[])
        : (defaultValue as T[])

      return this.paginationService.filterIn<T>(field, finalValue)
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

  return mixin(MixinPaginationFilterInEnumPipe)
}
