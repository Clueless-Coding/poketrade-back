import { PaginationOptions } from 'src/common/types';

export type FindEntitiesOptions<TWhere extends Record<string, unknown>> = Partial<{
  where: TWhere,
}>;

export type FindEntityOptions<TWhere extends Record<string, unknown>> = FindEntitiesOptions<TWhere> & Partial<{
  notFoundErrorMessage: string,
}>;

export type FindEntityByIdOptions<TId> = {
  id: TId,
} & Partial<{
  notFoundErrorMessageFn: (id: TId) => string,
}>;

export type FindEntitiesByIdsOptions<TId> =  {
  ids: Array<TId>,
} & Partial<{
  notFoundErrorMessageFn: (id: TId) => string,
}>;

export type FindEntitiesWithPaginationOptions<TWhere extends Record<string, unknown>> = FindEntitiesOptions<TWhere> & {
  paginationOptions: PaginationOptions,
};

