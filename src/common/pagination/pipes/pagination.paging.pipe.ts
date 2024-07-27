import { Inject, Injectable, mixin, Type } from '@nestjs/common'
import { PipeTransform, Scope } from '@nestjs/common/interfaces'
import { REQUEST } from '@nestjs/core'

import { IRequestApp } from '@common/request/interfaces/request.interface'
import { PaginationService } from '@common/pagination/services/pagination.service'
import { PAGINATION_DEFAULT_PAGE } from '@common/pagination/constants/pagination.constant'

export function PaginationPagingPipe(
  defaultPerPage: number = PAGINATION_DEFAULT_PAGE
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinPaginationPagingPipe implements PipeTransform {
    constructor(
      @Inject(REQUEST) protected readonly request: IRequestApp,
      private readonly paginationService: PaginationService
    ) {}

    async transform(value: Record<string, any>): Promise<Record<string, any>> {
      const page: number = this.paginationService.page(
        value?.page ? Number.parseInt(value?.page) : 1
      )
      const perPage: number = this.paginationService.perPage(
        Number.parseInt(value?.perPage ?? defaultPerPage)
      )
      const offset: number = this.paginationService.offset(page, perPage)

      this.addToRequestInstance(page, perPage)
      return {
        ...value,
        page,
        perPage,
        _limit: perPage,
        _offset: offset
      }
    }

    addToRequestInstance(page: number, perPage: number): void {
      this.request.__pagination = {
        ...this.request.__pagination,
        page,
        perPage
      }
    }
  }

  return mixin(MixinPaginationPagingPipe)
}
