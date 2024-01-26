import { Injectable } from '@nestjs/common';
import { Nullable, Optional, PaginatedArray, PaginationOptions, UUIDv4 } from 'src/common/types';
import { PackEntity, packsTable, packsToPokemonsTable, PokemonEntity, pokemonsTable } from 'src/infra/postgres/tables';
import { and, eq, getTableColumns, inArray, like, SQL, sql } from 'drizzle-orm';
import { Database } from 'src/infra/postgres/other/types';
import { InjectDatabase } from 'src/infra/decorators/inject-database.decorator';
import { mapArrayToPaginatedArray } from 'src/common/helpers/map-array-to-paginated-array.helper';

type FindPokemonsWhere = Partial<{
  id: UUIDv4,
  ids: Array<UUIDv4>,
  name: string,
  nameLike: string,
}>;

type FindPacksOptions = Partial<{
  where: FindPokemonsWhere,
}>

type FindPacksWithPaginationOptions = FindPacksOptions & {
  paginationOptions: PaginationOptions,
}

export const mapFindPokemonsWhereToSql = (
  where: FindPokemonsWhere
): Optional<SQL> => {
  return and(
    where.id !== undefined ? eq(packsTable.id, where.id) : undefined,
    where.ids !== undefined ? inArray(packsTable.id, where.ids) : undefined,
    where.name !== undefined ? eq(packsTable.name, where.name) : undefined,
    where.nameLike !== undefined ? like(packsTable.name, `%${where.nameLike}%`) : undefined,
  );
}


@Injectable()
export class PacksService {
  public constructor(
    @InjectDatabase()
    private readonly db: Database,
  ) {}

  private baseSelectBuilder(
    findPacksOptions: FindPacksOptions,
  ) {
    const { where = {} } = findPacksOptions;

    return this.db
      .select()
      .from(packsTable)
      .where(mapFindPokemonsWhereToSql(where));
  }

  public async findPacksWithPagination(
    findPacksWithPaginationOptions: FindPacksWithPaginationOptions,
  ): Promise<PaginatedArray<PackEntity>> {
    const {
      paginationOptions: { page, limit },
    } = findPacksWithPaginationOptions;
    // TODO: check for boundaries
    const offset = (page - 1) * limit;

    return this
      .baseSelectBuilder(findPacksWithPaginationOptions)
      .offset(offset)
      .limit(limit)
      .then((packs) => mapArrayToPaginatedArray(packs, { page, limit }))
  }

  public async findPack(
    findPacksOptions: FindPacksOptions,
  ): Promise<Nullable<PackEntity>> {
    return this.baseSelectBuilder(findPacksOptions)
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
