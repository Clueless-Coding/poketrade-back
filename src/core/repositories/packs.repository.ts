import { PaginatedArray, UUIDv4 } from 'src/common/types';
import { PokemonEntity } from '../entities/pokemon.entity';
import { CreatePackEntityValues, PackEntity, UpdatePackEntityValues } from '../entities/pack.entity';
import { FindEntitiesWithPaginationOptions, FindEntityByIdOptions, FindEntityOptions } from '../types';
import { PackToPokemonEntity } from '../entities/pack-to-pokemon.entity';

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
    options: FindEntityByIdOptions<UUIDv4>,
  ): Promise<PackEntity>;

  public abstract findRandomPokemonFromPack(
    pack: PackEntity
  ): Promise<PokemonEntity>;

  public abstract createPack(
    values: CreatePackEntityValues,
    tx?: unknown,
  ): Promise<{
    pack: PackEntity,
    packsToPokemons: Array<PackToPokemonEntity>,
  }>;

  public abstract updatePack(
    pack: PackEntity,
    values: UpdatePackEntityValues,
    tx?: unknown,
  ): Promise<{
    pack: PackEntity,
    packsToPokemons?: Array<PackToPokemonEntity>,
  }>

  public abstract deletePack(
    pack: PackEntity,
    tx?: unknown,
  ): Promise<{
    pack: PackEntity,
    packsToPokemons: Array<PackToPokemonEntity>,
  }>;
}
