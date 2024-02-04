import { CreatePokemonEntityValues, PokemonEntity } from '../entities/pokemon.entity';

export abstract class IPokemonsRepository {
  public abstract createPokemons(
    values: Array<CreatePokemonEntityValues>,
    tx?: unknown,
  ): Promise<Array<PokemonEntity>>;

  public abstract deleteAllPokemons(
    tx?: unknown,
  ): Promise<void>;
}

