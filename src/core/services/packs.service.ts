import { Injectable } from '@nestjs/common';
import { Nullable, Optional, PaginatedArray, PaginationOptions, UUIDv4 } from 'src/common/types';
import { PackEntity, packsTable, packsToPokemonsTable, PokemonEntity, pokemonsTable } from 'src/infra/postgres/tables';
import { and, eq, getTableColumns, inArray, like, SQL, sql } from 'drizzle-orm';
import { Database } from 'src/infra/postgres/other/types';
import { InjectDatabase } from 'src/infra/decorators/inject-database.decorator';
import { mapArrayToPaginatedArray } from 'src/common/helpers/map-array-to-paginated-array.helper';

type Where = Partial<{
  id: UUIDv4,
  ids: Array<UUIDv4>,
  name: string,
  nameLike: string,
}>;

type FindOptions = Partial<{
  where: Where,
}>

type FindWithPaginationOptions = FindOptions & {
  paginationOptions: PaginationOptions,
}

@Injectable()
export class PacksService {
  public constructor(
    @InjectDatabase()
    private readonly db: Database,
  ) {}

  private mapWhereToSql(
    where: Where
  ): Optional<SQL> {
    return and(
      where.id !== undefined
        ? eq(packsTable.id, where.id)
        : undefined,
      where.ids !== undefined
        ? inArray(packsTable.id, where.ids)
        : undefined,
      where.name !== undefined
        ? eq(packsTable.name, where.name)
        : undefined,
      where.nameLike !== undefined
        ? like(packsTable.name, `%${where.nameLike}%`)
        : undefined,
    )
  }

  private baseSelectBuilder(
    findOptions: FindOptions,
  ) {
    const { where = {} } = findOptions;

    return this.db
      .select()
      .from(packsTable)
      .where(this.mapWhereToSql(where));
  }

  public async findManyWithPagination(
    findWithPaginationOptions: FindWithPaginationOptions,
  ): Promise<PaginatedArray<PackEntity>> {
    const {
      paginationOptions: { page, limit },
    } = findWithPaginationOptions;
    // TODO: check for boundaries
    const offset = (page - 1) * limit;

    return this
      .baseSelectBuilder(findWithPaginationOptions)
      .offset(offset)
      .limit(limit)
      .then((packs) => mapArrayToPaginatedArray(packs, { page, limit }))
  }

  public async findOne(
    findOptions: FindOptions,
  ): Promise<Nullable<PackEntity>> {
    return this.baseSelectBuilder(findOptions)
      .limit(1)
      .then(([pack]) => pack ?? null);
  }

  public async findRandomPokemonFromPack(
    pack: PackEntity
  ): Promise<Nullable<PokemonEntity>> {
    return this.db
      .select({ pokemon: getTableColumns(pokemonsTable) })
      .from(packsTable)
      .innerJoin(packsToPokemonsTable, eq(packsToPokemonsTable.packId, packsTable.id))
      .innerJoin(pokemonsTable, eq(pokemonsTable.id, packsToPokemonsTable.pokemonId))
      .where(eq(packsTable.id, pack.id))
      .orderBy(sql<number>`random()`)
      .limit(1)
      .then(([row]) => row?.pokemon ?? null);
  }
}
