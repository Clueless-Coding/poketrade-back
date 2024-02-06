import { PaginatedArray, UUIDv4 } from "src/common/types";
import { CreatePackToPokemonEntityValues, PackToPokemonEntity } from "../entities/pack-to-pokemon.entity";
import { FindEntitiesWithPaginationOptions } from "../types";
import { PackEntity } from "../entities/pack.entity";

export type FindPacksToPokemonsWhere = Partial<{
  packId: UUIDv4,
  pokemonId: number,
}>;

export abstract class IPacksToPokemonsRepository {
  public abstract findPacksToPokemonsWithPagination(
    options: FindEntitiesWithPaginationOptions<FindPacksToPokemonsWhere>,
  ): Promise<PaginatedArray<PackToPokemonEntity>>;

  public abstract createPacksToPokemons(
    valuesArray: Array<CreatePackToPokemonEntityValues>,
    tx?: unknown,
  ): Promise<Array<PackToPokemonEntity>>;

  public abstract deletePacksToPokemonsByPack(
    pack: PackEntity,
    tx?: unknown,
  ): Promise<Array<PackToPokemonEntity>>;
}
