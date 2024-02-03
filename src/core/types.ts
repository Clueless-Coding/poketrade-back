import { PaginationOptions, UUIDv4 } from 'src/common/types';

export type FindEntitiesOptions<TWhere extends Record<string, unknown>> = Partial<{
  where: TWhere,
}>;

export type FindEntityOptions<TWhere extends Record<string, unknown>> = FindEntitiesOptions<TWhere> & Partial<{
  notFoundErrorMessage: string,
}>;

export type FindEntityByIdOptions = {
  id: UUIDv4,
} & Partial<{
  notFoundErrorMessageFn: (id: UUIDv4) => string,
}>;

export type FindEntitiesByIdsOptions =  {
  ids: Array<UUIDv4>,
} & Partial<{
  notFoundErrorMessageFn: (id: UUIDv4) => string,
}>;

export type FindEntitiesWithPaginationOptions<TWhere extends Record<string, unknown>> = FindEntitiesOptions<TWhere> & {
  paginationOptions: PaginationOptions,
};

