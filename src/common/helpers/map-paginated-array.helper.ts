import { Dictionary, ModelIdentifier, Mapper } from '@automapper/core';
import { PaginatedArray } from '../types';

export const mapPaginatedArray = <TSource extends Dictionary<TSource>, TDestination extends Dictionary<TDestination>>(
  mapper: Mapper,
  sourcePaginatedArray: PaginatedArray<TSource>,
  sourceIdentifier: ModelIdentifier<TSource>,
  destinationIdentifier: ModelIdentifier<TDestination>,
): PaginatedArray<TDestination> => ({
  ...sourcePaginatedArray,
  items: mapper.mapArray(sourcePaginatedArray.items, sourceIdentifier, destinationIdentifier),
});

