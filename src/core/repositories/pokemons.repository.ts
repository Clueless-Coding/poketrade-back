import { CreatePokemonEntityValues, PokemonEntity } from 'src/infra/postgres/tables';

export abstract class IPokemonsRepository {
  public abstract createPokemons(
    values: Array<CreatePokemonEntityValues>,
    tx?: unknown,
  ): Promise<Array<PokemonEntity>>;

  public abstract deleteAllPokemons(
    tx?: unknown,
  ): Promise<void>;
}

