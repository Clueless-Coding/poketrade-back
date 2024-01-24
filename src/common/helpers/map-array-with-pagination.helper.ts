import { Dictionary, ModelIdentifier, Mapper } from '@automapper/core';
import { PaginatedArray } from '../types';

export const mapArrayWithPagination = <TSource extends Dictionary<TSource>, TDestination extends Dictionary<TDestination>>(
  mapper: Mapper,
  sourceObjectWithPagination: PaginatedArray<TSource>,
  sourceIdentifier: ModelIdentifier<TSource>,
  destinationIdentifier: ModelIdentifier<TDestination>,
): PaginatedArray<TDestination> => {
  return {
    ...sourceObjectWithPagination,
    items: mapper.mapArray(sourceObjectWithPagination.items, sourceIdentifier, destinationIdentifier),
  };
}

