import { Injectable } from '@nestjs/common';
import { Database, Transaction } from 'src/infra/postgres/other/types';
import { InjectDatabase } from 'src/infra/decorators/inject-database.decorator';
import { Nullable, Optional, PaginatedArray, PaginationOptions, UUIDv4 } from 'src/common/types';
import { CreateUserItemEntityValues, pokemonsTable, UpdateUserItemEntityValues, UserItemEntity, userItemsTable, usersTable } from 'src/infra/postgres/tables';
import { and, eq, inArray, like, SQL } from 'drizzle-orm';
import { mapArrayToPaginatedArray } from 'src/common/helpers/map-array-to-paginated-array.helper';
import { zip } from 'lodash';

type Where = Partial<{
  id: UUIDv4,
  ids: Array<UUIDv4>,
  userId: UUIDv4,
  pokemonId: number,
  userName: string,
  userNameLike: string,
  pokemonName: string,
  pokemonNameLike: string,
}>;

type FindOptions = Partial<{
  where: Where,
}>

type FindWithPaginationOptions = FindOptions & {
  paginationOptions: PaginationOptions,
}

@Injectable()
export class UserItemsService {
  public constructor(
    @InjectDatabase()
    private readonly db: Database,
  ) {}

  private mapWhereToSQL(
    where: Where
  ): Optional<SQL> {
    return and(
      where.id !== undefined
        ? eq(userItemsTable.id, where.id)
        : undefined,
      where.ids !== undefined
        ? inArray(userItemsTable.id, where.ids)
        : undefined,

      where.userId !== undefined
        ? eq(userItemsTable.userId, where.userId)
        : undefined,
      where.userName !== undefined
        ? eq(usersTable.name, where.userName)
        : undefined,
      where.userNameLike !== undefined
        ? like(usersTable.name, `%${where.userNameLike}%`)
        : undefined,

      where.pokemonId !== undefined
        ? eq(userItemsTable.pokemonId, where.pokemonId)
        : undefined,
      where.pokemonName !== undefined
        ? eq(pokemonsTable.name, where.pokemonName)
        : undefined,
      where.pokemonNameLike !== undefined
        ? like(pokemonsTable.name, `%${where.pokemonNameLike}%`)
        : undefined,
    )
  }

  private baseSelectBuilder(
    findOptions: FindOptions,
  ) {
    const { where = {} } = findOptions;

    return this.db
      .select()
      .from(userItemsTable)
      .innerJoin(usersTable, eq(userItemsTable.userId, usersTable.id))
      .innerJoin(pokemonsTable, eq(userItemsTable.pokemonId, pokemonsTable.id))
      .where(this.mapWhereToSQL(where));
  }

  public mapSelectBuilderRowToEntity(
  row: Record<'user_items' | 'users' | 'pokemons', any>,
  ) {
    return {
      ...row.user_items,
      user: row.users,
      pokemon: row.pokemons,
    }
  }

  public async findMany(
    findOptions: FindOptions,
  ): Promise<Array<UserItemEntity>> {
    return this
      .baseSelectBuilder(findOptions)
      .then((rows) => rows.map((row) => this.mapSelectBuilderRowToEntity(row)));
  }

  public async findManyWithPagination(
    findWithPaginationOptions: FindWithPaginationOptions,
  ): Promise<PaginatedArray<UserItemEntity>> {
    const { paginationOptions: { page, limit } } = findWithPaginationOptions;
    // TODO: check for boundaries
    const offset = (page - 1) * limit;

    return this
      .baseSelectBuilder(findWithPaginationOptions)
      .offset(offset)
      .limit(limit)
      .then((rows) => mapArrayToPaginatedArray(
        rows.map((row) => this.mapSelectBuilderRowToEntity(row)),
        { page, limit },
      ));
  }

  public async findOne(
    findOptions: FindOptions,
  ): Promise<Nullable<UserItemEntity>> {
    return this
      .baseSelectBuilder(findOptions)
      .limit(1)
      .then(([row]) => (
        row
          ? this.mapSelectBuilderRowToEntity(row)
          : null
      ));
  }

  public async createOne(
    values: CreateUserItemEntityValues,
    tx?: Transaction,
  ): Promise<UserItemEntity> {
    const { user, pokemon } = values;

    return (tx ?? this.db)
      .insert(userItemsTable)
      .values({
        ...values,
        userId: user.id,
        pokemonId: pokemon.id,
      })
      .returning()
      .then(([userItem]) => ({
        ...userItem!,
        user,
        pokemon,
      }));
  }

  public async updateMany(
    userItems: Array<UserItemEntity>,
    values: UpdateUserItemEntityValues,
    tx?: Transaction,
  ): Promise<Array<UserItemEntity>> {
    if (!userItems.length) return [];

    const { user, pokemon, ...restValues } = values;

    return (tx ?? this.db)
      .update(userItemsTable)
      .set({
        ...restValues,
        userId: user?.id,
        pokemonId: pokemon?.id,
      })
      .where(inArray(userItemsTable.id, userItems.map(({ id }) => id)))
      .returning()
      .then((updatedUserItems) => zip(userItems, updatedUserItems).map(([userItem, updatedUserItem]) => ({
        ...updatedUserItem!,
        user: user ?? userItem!.user,
        pokemon: pokemon ?? userItem!.pokemon,
      })));
  }

  public async updateOne(
    userItem: UserItemEntity,
    values: UpdateUserItemEntityValues,
    tx?: Transaction,
  ): Promise<UserItemEntity> {
    return this
      .updateMany([userItem], values, tx)
      .then(([userItem]) => userItem!);
  }

  public async deleteOne(
    userItem: UserItemEntity,
    tx?: Transaction,
  ): Promise<UserItemEntity> {
    return (tx ?? this.db)
      .delete(userItemsTable)
      .where(eq(userItemsTable.id, userItem.id))
      .returning()
      .then(([deletedUserItem]) => ({
        ...deletedUserItem!,
        user: userItem.user,
        pokemon: userItem.pokemon,
      }))
  }
}
