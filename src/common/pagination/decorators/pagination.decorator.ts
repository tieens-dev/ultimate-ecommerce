import { Query } from '@nestjs/common'
import {
  IPaginationFilterDateOptions,
  IPaginationFilterEqualOptions,
  IPaginationFilterOptions,
  IPaginationQueryOptions
} from '@common/pagination/interfaces/pagination.interface'
import {
  PaginationFilterDatePipe,
  PaginationFilterEqualPipe,
  PaginationFilterInBooleanPipe,
  PaginationFilterInEnumPipe,
  PaginationFilterNinEnumPipe,
  PaginationFilterNotEqualPipe,
  PaginationFilterStringContainPipe,
  PaginationOrderPipe,
  PaginationPagingPipe,
  PaginationSearchPipe
} from '@common/pagination/pipes'

//! Pagination query helper
export function PaginationQuery(
  options?: IPaginationQueryOptions
): ParameterDecorator {
  return Query(
    PaginationSearchPipe(options?.availableSearch),
    PaginationPagingPipe(options?.defaultPerPage),
    PaginationOrderPipe(
      options?.defaultOrderBy,
      options?.defaultOrderDirection,
      options?.availableOrderBy
    )
  )
}

//! Pagination query filter boolean will convert into repository query
export function PaginationQueryFilterInBoolean(
  field: string,
  defaultValue: boolean[],
  options?: IPaginationFilterOptions
): ParameterDecorator {
  return Query(
    options?.queryField ?? field,
    PaginationFilterInBooleanPipe(field, defaultValue, options)
  )
}

//! Pagination query filter enum will convert into repository
export function PaginationQueryFilterInEnum<T>(
  field: string,
  defaultValue: T,
  defaultEnum: Record<string, any>,
  options?: IPaginationFilterOptions
): ParameterDecorator {
  return Query(
    options?.queryField ?? field,
    PaginationFilterInEnumPipe<T>(field, defaultValue, defaultEnum, options)
  )
}

//! Pagination query filter enum will convert into repository
export function PaginationQueryFilterNinEnum<T>(
  field: string,
  defaultValue: T,
  defaultEnum: Record<string, any>,
  options?: IPaginationFilterOptions
): ParameterDecorator {
  return Query(
    options?.queryField ?? field,
    PaginationFilterNinEnumPipe<T>(field, defaultValue, defaultEnum, options)
  )
}

//! Pagination query filter equal will convert into repository
export function PaginationQueryFilterNotEqual(
  field: string,
  options?: IPaginationFilterEqualOptions
): ParameterDecorator {
  return Query(
    options?.queryField ?? field,
    PaginationFilterNotEqualPipe(field, options)
  )
}

//! Pagination query filter equal will convert into repository
export function PaginationQueryFilterEqual(
  field: string,
  options?: IPaginationFilterEqualOptions
): ParameterDecorator {
  return Query(
    options?.queryField ?? field,
    PaginationFilterEqualPipe(field, options)
  )
}

//! Pagination query filter string contain will convert into repository
export function PaginationQueryFilterStringContain(
  field: string,
  options?: IPaginationFilterOptions
): ParameterDecorator {
  return Query(
    options?.queryField ?? field,
    PaginationFilterStringContainPipe(field, options)
  )
}

//! Pagination query filter date will convert into repository
export function PaginationQueryFilterDate(
  field: string,
  options?: IPaginationFilterDateOptions
): ParameterDecorator {
  return Query(
    options?.queryField ?? field,
    PaginationFilterDatePipe(field, options)
  )
}
