import { Dictionary, ModelIdentifier, Mapper } from '@automapper/core';
import { Pagination } from 'nestjs-typeorm-paginate';

export const mapArrayWithPagination = <TSource extends Dictionary<TSource>, TDestination extends Dictionary<TDestination>>(
  mapper: Mapper,
  sourceObjectWithPagination: Pagination<TSource>,
  sourceIdentifier: ModelIdentifier<TSource>,
  destinationIdentifier: ModelIdentifier<TDestination>) => {
  return {
    ...sourceObjectWithPagination,
    items: mapper.mapArray(sourceObjectWithPagination.items, sourceIdentifier, destinationIdentifier),
  };
}

