import { Injectable } from '@nestjs/common';
import { Nullable, Optional, PaginatedArray, UUIDv4 } from 'src/common/types';
import { packsTable, packsToPokemonsTable, pokemonsTable } from 'src/infra/postgres/tables';
import { CreatePackEntityValues, PackEntity, UpdatePackEntityValues } from 'src/core/entities/pack.entity';
import { PokemonEntity } from 'src/core/entities/pokemon.entity';
import { and, eq, getTableColumns, inArray, like, SQL, sql } from 'drizzle-orm';
import { Database, Transaction } from 'src/infra/postgres/types';
import { InjectDatabase } from 'src/infra/ioc/decorators/inject-database.decorator';
import { mapArrayToPaginatedArray } from 'src/common/helpers/map-array-to-paginated-array.helper';
import { AppEntityNotFoundException, AppInternalException } from 'src/core/exceptions';
import { FindEntitiesOptions, FindEntitiesWithPaginationOptions, FindEntityByIdOptions, FindEntityOptions } from 'src/core/types';
import { FindPacksWhere, IPacksRepository } from 'src/core/repositories/packs.repository';
import { transformPaginationOptions } from 'src/common/helpers/transform-pagination-options.helper';
import { calculateOffsetFromPaginationOptions } from 'src/common/helpers/calculate-offset-from-pagination-options.helper';
import { getTotalPaginationMeta } from 'src/common/helpers/get-total-pagination-meta.helper';
import { IPacksToPokemonsRepository } from 'src/core/repositories/packs-to-pokemons.repository';
import { PackToPokemonEntity } from 'src/core/entities/pack-to-pokemon.entity';

@Injectable()
export class PacksRepository implements IPacksRepository {
  public constructor(
    @InjectDatabase()
    private readonly db: Database,

    private readonly packsToPokemonsRepository: IPacksToPokemonsRepository,
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
      paginationOptions,
      where = {},
    } = options;

    const transformedPaginationOptions = transformPaginationOptions(paginationOptions);

    const { page, limit } = transformedPaginationOptions;
    const offset = calculateOffsetFromPaginationOptions(transformedPaginationOptions);

    const { totalItems, totalPages } = await getTotalPaginationMeta({
      db: this.db,
      table: packsTable,
      whereSQL: this.mapWhereToSQL(where),
      limit,
    });

    return this
      .baseSelectBuilder(options)
      .offset(offset)
      .limit(limit)
      .then((packs) => mapArrayToPaginatedArray(packs, { page, limit, totalItems, totalPages }))
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
    options: FindEntityByIdOptions<UUIDv4>,
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

  public async createPack(
    values: CreatePackEntityValues,
    tx?: Transaction
  ): Promise<{
    pack: PackEntity,
    packsToPokemons: Array<PackToPokemonEntity>,
  }> {
    const { pokemons } = values;

    const pack = await (tx ?? this.db)
      .insert(packsTable)
      .values(values)
      .returning()
      .then(([pack]) => pack!);

    const packsToPokemons = await this.packsToPokemonsRepository.createPacksToPokemons(
      pokemons.map((pokemon) => ({ pack, pokemon })),
      tx,
    );

    return {
      pack,
      packsToPokemons,
    };
  }

  public async updatePack(
    pack: PackEntity,
    values: UpdatePackEntityValues,
    tx?: Transaction
  ): Promise<{
    pack: PackEntity,
    packsToPokemons?: Array<PackToPokemonEntity>,
  }> {
    const { pokemons } = values;

    const updatedPack = await (tx ?? this.db)
      .update(packsTable)
      .set(values)
      .where(eq(packsTable.id, pack.id))
      .returning()
      .then(([updatedPack]) => updatedPack!);

    let packsToPokemons: Optional<Array<PackToPokemonEntity>>;
    if (pokemons) {
      await this.packsToPokemonsRepository.deletePacksToPokemonsByPack(pack),
      packsToPokemons = await this.packsToPokemonsRepository.createPacksToPokemons(
        pokemons.map((pokemon) => ({ pack, pokemon })),
      );
    }

    return {
      pack: updatedPack,
      packsToPokemons,
    };
  }

  public async deletePack(
    pack: PackEntity,
    tx?: Transaction,
  ): Promise<{
    pack: PackEntity,
    packsToPokemons: Array<PackToPokemonEntity>,
  }> {
    const deletedPack = await (tx ?? this.db)
      .delete(packsTable)
      .where(eq(packsTable.id, pack.id))
      .returning()
      .then(([deletedPack]) => deletedPack!);

    const deletedPackToPokemons = await this.packsToPokemonsRepository.deletePacksToPokemonsByPack(pack, tx);

    return {
      pack: deletedPack,
      packsToPokemons: deletedPackToPokemons,
    };
  }
}
