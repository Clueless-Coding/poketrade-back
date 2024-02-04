import { PaginatedArray, UUIDv4 } from 'src/common/types';
import { PokemonEntity } from '../entities/pokemon.entity';
import { PackEntity } from '../entities/pack.entity';
import { FindEntitiesWithPaginationOptions, FindEntityByIdOptions, FindEntityOptions } from '../types';

export type FindPacksWhere = Partial<{
  id: UUIDv4,
  ids: Array<UUIDv4>,
  name: string,
  nameLike: string,
}>;

export abstract class IPacksRepository {
  public abstract findPacksWithPagination(
    options: FindEntitiesWithPaginationOptions<FindPacksWhere>,
  ): Promise<PaginatedArray<PackEntity>>;

  public abstract findPack(
    options: FindEntityOptions<FindPacksWhere>,
  ): Promise<PackEntity>;

  public abstract findPackById(
    options: FindEntityByIdOptions,
  ): Promise<PackEntity>;

  public abstract findRandomPokemonFromPack(
    pack: PackEntity
  ): Promise<PokemonEntity>;
}
