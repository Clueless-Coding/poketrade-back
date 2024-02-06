import { CreatePokemonEntityValues, PokemonEntity } from '../entities/pokemon.entity';
import { FindEntitiesByIdsOptions, FindEntitiesOptions } from '../types';

export type FindPokemonsWhere = Partial<{
  id: number,
  ids: Array<number>,
  name: string,
}>;

export abstract class IPokemonsRepository {
  public abstract findPokemons(
    options: FindEntitiesOptions<FindPokemonsWhere>,
  ): Promise<Array<PokemonEntity>>;

  public abstract findPokemonsByIds(
    options: FindEntitiesByIdsOptions<number>,
  ): Promise<Array<PokemonEntity>>;

  public abstract createPokemons(
    values: Array<CreatePokemonEntityValues>,
    tx?: unknown,
  ): Promise<Array<PokemonEntity>>;

  public abstract deleteAllPokemons(
    tx?: unknown,
  ): Promise<void>;
}

