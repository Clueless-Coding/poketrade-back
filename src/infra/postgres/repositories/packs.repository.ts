import { Injectable } from '@nestjs/common';
import { Optional, PaginatedArray } from 'src/common/types';
import { PackEntity, packsTable, packsToPokemonsTable, PokemonEntity, pokemonsTable } from 'src/infra/postgres/tables';
import { and, eq, getTableColumns, inArray, like, SQL, sql } from 'drizzle-orm';
import { Database } from 'src/infra/postgres/types';
import { InjectDatabase } from 'src/infra/ioc/decorators/inject-database.decorator';
import { mapArrayToPaginatedArray } from 'src/common/helpers/map-array-to-paginated-array.helper';
import { AppEntityNotFoundException, AppInternalException } from 'src/core/exceptions';
import { FindEntitiesOptions, FindEntitiesWithPaginationOptions, FindEntityByIdOptions, FindEntityOptions } from 'src/core/types';
import { FindPacksWhere, IPacksRepository } from 'src/core/repositories/packs.repository';

@Injectable()
export class PacksRepository implements IPacksRepository {
  public constructor(
    @InjectDatabase()
    private readonly db: Database,
  ) {}

  private mapWhereToSQL(
    where: FindPacksWhere,
  ): Optional<SQL> {
    return and(
      where.id !== undefined ? eq(packsTable.id, where.id) : undefined,
      where.ids !== undefined ? inArray(packsTable.id, where.ids) : undefined,
      where.name !== undefined ? eq(packsTable.name, where.name) : undefined,
      where.nameLike !== undefined ? like(packsTable.name, `%${where.nameLike}%`) : undefined,
    );
  }

  private baseSelectBuilder(
    options: FindEntitiesOptions<FindPacksWhere>,
  ) {
    const { where = {} } = options;

    return this.db
      .select()
      .from(packsTable)
      .where(this.mapWhereToSQL(where));
  }

  public async findPacksWithPagination(
    options: FindEntitiesWithPaginationOptions<FindPacksWhere>,
  ): Promise<PaginatedArray<PackEntity>> {
    const {
      paginationOptions: { page, limit },
    } = options;
    // TODO: check for boundaries
    const offset = (page - 1) * limit;

    return this
      .baseSelectBuilder(options)
      .offset(offset)
      .limit(limit)
      .then((packs) => mapArrayToPaginatedArray(packs, { page, limit }))
  }

  public async findPack(
    options: FindEntityOptions<FindPacksWhere>,
  ): Promise<PackEntity> {
    const {
      notFoundErrorMessage = 'Pack not found',
    } = options;

    const pack = await this
      .baseSelectBuilder(options)
      .limit(1)
      .then(([pack]) => pack ?? null);

    if (!pack) {
      throw new AppEntityNotFoundException(notFoundErrorMessage);
    }

    return pack;
  }

  public async findPackById(
    options: FindEntityByIdOptions,
  ): Promise<PackEntity> {
    const {
      id,
      notFoundErrorMessageFn = (id) => `Pack (\`${id}\`) not found`,
    } = options;

    return this.findPack({
      where: { id },
      notFoundErrorMessage: notFoundErrorMessageFn(id),
    })
  }

  public async findRandomPokemonFromPack(
    pack: PackEntity
  ): Promise<PokemonEntity> {
    const pokemon = await this.db
      .select({ pokemon: getTableColumns(pokemonsTable) })
      .from(packsTable)
      .innerJoin(packsToPokemonsTable, eq(packsToPokemonsTable.packId, packsTable.id))
      .innerJoin(pokemonsTable, eq(pokemonsTable.id, packsToPokemonsTable.pokemonId))
      .where(eq(packsTable.id, pack.id))
      .orderBy(sql<number>`random()`)
      .limit(1)
      .then(([row]) => row?.pokemon ?? null);

    if (!pokemon) {
      throw new AppInternalException(
        'There are no pokemons in the pack. Please notify the developer about it :)',
      );
    }

    return pokemon;
  }
}
