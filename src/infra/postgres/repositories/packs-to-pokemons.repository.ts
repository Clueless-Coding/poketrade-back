import { Injectable } from '@nestjs/common';
import { FindPacksToPokemonsWhere, IPacksToPokemonsRepository } from 'src/core/repositories/packs-to-pokemons.repository';
import { InjectDatabase } from 'src/infra/ioc/decorators/inject-database.decorator';
import { Database, Transaction } from '../types';
import { Optional, PaginatedArray } from 'src/common/types';
import { SQL, and, eq, inArray } from 'drizzle-orm';
import { packsTable, packsToPokemonsTable, pokemonsTable } from '../tables';
import { FindEntitiesOptions, FindEntitiesWithPaginationOptions } from 'src/core/types';
import { PackToPokemonEntity } from 'src/core/entities/pack-to-pokemon.entity';
import { transformPaginationOptions } from 'src/common/helpers/transform-pagination-options.helper';
import { calculateOffsetFromPaginationOptions } from 'src/common/helpers/calculate-offset-from-pagination-options.helper';
import { getTotalPaginationMeta } from 'src/common/helpers/get-total-pagination-meta.helper';
import { mapArrayToPaginatedArray } from 'src/common/helpers/map-array-to-paginated-array.helper';
import { zip } from 'lodash';
import { PackEntity } from 'src/core/entities/pack.entity';

export const mapPacksToPokemonsRowToEntity = (
  row: Record<
    | 'packs_to_pokemons'
    | 'packs'
    | 'pokemons',
    any>,
): PackToPokemonEntity => ({
  ...row.packs_to_pokemons,
  pack: row.packs,
  pokemon: row.pokemons,
});

@Injectable()
export class PacksToPokemonsRepository implements IPacksToPokemonsRepository {
  public constructor(
    @InjectDatabase()
    private readonly db: Database,
  ) {}

  private mapWhereToSQL(
    where: FindPacksToPokemonsWhere,
  ): Optional<SQL> {
    return and(
      where.packId !== undefined ? eq(packsToPokemonsTable.packId, where.packId) : undefined,
      where.pokemonId !== undefined ? eq(packsToPokemonsTable.pokemonId, where.pokemonId) : undefined,
    );
  }

  private baseSelectBuilder(
    options: FindEntitiesOptions<FindPacksToPokemonsWhere>,
  ) {
    const { where = {} } = options;

    return this.db
      .select()
      .from(packsToPokemonsTable)
      .innerJoin(packsTable, eq(packsTable.id, packsToPokemonsTable.packId))
      .innerJoin(pokemonsTable, eq(pokemonsTable.id, packsToPokemonsTable.pokemonId))
      .where(this.mapWhereToSQL(where));
  }

  public async findPacksToPokemons(
    options: FindEntitiesOptions<FindPacksToPokemonsWhere>,
  ): Promise<Array<PackToPokemonEntity>> {
    return this
      .baseSelectBuilder(options)
      .then((rows) => rows.map((row) => mapPacksToPokemonsRowToEntity(row)));
  }

  public async findPacksToPokemonsWithPagination(
    options: FindEntitiesWithPaginationOptions<FindPacksToPokemonsWhere>,
  ): Promise<PaginatedArray<PackToPokemonEntity>> {
    const {
      paginationOptions,
      where = {},
    } = options;

    const transformedPaginationOptions = transformPaginationOptions(paginationOptions);

    const { page, limit } = transformedPaginationOptions;
    const offset = calculateOffsetFromPaginationOptions(transformedPaginationOptions);

    const { totalItems, totalPages } = await getTotalPaginationMeta({
      db: this.db,
      table: packsToPokemonsTable,
      whereSQL: this.mapWhereToSQL(where),
      limit,
    });

    return this
      .baseSelectBuilder(options)
      .offset(offset)
      .limit(limit)
      .then((rows) => mapArrayToPaginatedArray(
        rows.map(row => mapPacksToPokemonsRowToEntity(row)),
        { page, limit, totalItems, totalPages })
      );
  }

  public async createPacksToPokemons(valuesArray: Array<PackToPokemonEntity>, tx?: Transaction): Promise<Array<PackToPokemonEntity>> {
    if (!valuesArray.length) return [];

    return (tx ?? this.db)
      .insert(packsToPokemonsTable)
      .values(valuesArray.map((values) => ({
        ...values,
        packId: values.pack.id,
        pokemonId: values.pokemon.id,
      })))
      .returning()
      .then((packsToPokemons) => zip(valuesArray, packsToPokemons).map(([values, packToPokemon]) => ({
        ...packToPokemon!,
        pack: values!.pack,
        pokemon: values!.pokemon,
      })))
  }

  public async deletePacksToPokemons(
    packsToPokemons: Array<PackToPokemonEntity>,
    tx?: Transaction,
  ): Promise<Array<PackToPokemonEntity>> {
    if (!packsToPokemons.length) return [];

    return (tx ?? this.db)
      .delete(packsToPokemonsTable)
      .where(and(
        inArray(packsToPokemonsTable.packId, packsToPokemons.map(({ pack }) => pack.id)),
        inArray(packsToPokemonsTable.pokemonId, packsToPokemons.map(({ pokemon }) => pokemon.id)),
      ))
      .returning()
      .then((deletedPacksToPokemons) => (
        zip(packsToPokemons, deletedPacksToPokemons).map(([packToPokemon, deletedPackToPokemon]) => ({
          ...deletedPackToPokemon!,
          pack: packToPokemon!.pack,
          pokemon: packToPokemon!.pokemon,
        }))
      ));
  }

  public async deletePacksToPokemonsByPack(
    pack: PackEntity,
    tx?: Transaction,
  ): Promise<Array<PackToPokemonEntity>> {
    const packsToPokemons = await this.findPacksToPokemons({
      where: { packId: pack.id },
    });

    return this.deletePacksToPokemons(packsToPokemons, tx);
  }
}
