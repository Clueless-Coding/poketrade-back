import { Injectable } from '@nestjs/common';
import { Database, Transaction } from 'src/infra/postgres/types';
import { InjectDatabase } from 'src/infra/ioc/decorators/inject-database.decorator';
import { pokemonsTable } from 'src/infra/postgres/tables';
import { CreatePokemonEntityValues, PokemonEntity } from 'src/core/entities/pokemon.entity';
import { FindPokemonsWhere, IPokemonsRepository } from 'src/core/repositories/pokemons.repository';
import { FindEntitiesByIdsOptions, FindEntitiesOptions } from 'src/core/types';
import { and, eq, inArray } from 'drizzle-orm';
import { AppEntityNotFoundException } from 'src/core/exceptions';

@Injectable()
export class PokemonsRepository implements IPokemonsRepository {
  public constructor(
    @InjectDatabase()
    private readonly db: Database,
  ) {}

  private mapWhereToSQL(where: FindPokemonsWhere) {
    return and(
      where.id !== undefined ? eq(pokemonsTable.id, where.id) : undefined,
      where.ids !== undefined ? inArray(pokemonsTable.id, where.ids) : undefined,
      where.name !== undefined ? eq(pokemonsTable.name, where.name): undefined,
    );
  }

  private baseSelectBuilder(options: FindEntitiesOptions<FindPokemonsWhere>) {
    const { where = {} } = options;

    return this.db
      .select()
      .from(pokemonsTable)
      .where(this.mapWhereToSQL(where));
  }

  public async findPokemons(options: FindEntitiesOptions<FindPokemonsWhere>): Promise<Array<PokemonEntity>> {
    return this.baseSelectBuilder(options);
  }

  public async findPokemonsByIds(options: FindEntitiesByIdsOptions<number>): Promise<Array<PokemonEntity>> {
    const {
      ids,
      notFoundErrorMessageFn = (id) => `Pokemon (\`${id}\`) not found`,
    } = options;
    if (!ids.length) return [];

    const pokemons = await this.baseSelectBuilder({
      where: { ids },
    });

    for (const id of ids) {
      const pokemon = pokemons.some((pokemon) => pokemon.id === id);

      if (!pokemon) {
        throw new AppEntityNotFoundException(notFoundErrorMessageFn(id));
      }
    }

    return pokemons;
  }

  public async createPokemons(
    values: Array<CreatePokemonEntityValues>,
    tx?: Transaction,
  ): Promise<Array<PokemonEntity>> {
    if (!values.length) return [];

    return (tx ?? this.db)
      .insert(pokemonsTable)
      .values(values)
      .returning()
  }

  public async deleteAllPokemons(
    tx?: Transaction,
  ): Promise<void> {
    await (tx ?? this.db)
      .delete(pokemonsTable)
      .returning();
  }
}
