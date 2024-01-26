import { Injectable } from '@nestjs/common';
import { Database, Transaction } from 'src/infra/postgres/other/types';
import { InjectDatabase } from 'src/infra/decorators/inject-database.decorator';
import { Nullable, Optional, PaginatedArray, PaginationOptions, UUIDv4 } from 'src/common/types';
import { CreateUserItemEntityValues, pokemonsTable, UpdateUserItemEntityValues, UserItemEntity, userItemsTable, usersTable } from 'src/infra/postgres/tables';
import { and, eq, inArray, like, SQL } from 'drizzle-orm';
import { mapArrayToPaginatedArray } from 'src/common/helpers/map-array-to-paginated-array.helper';
import { zip } from 'lodash';

type FindUserItemsWhere = Partial<{
  id: UUIDv4,
  ids: Array<UUIDv4>,
  userId: UUIDv4,
  pokemonId: number,
  userName: string,
  userNameLike: string,
  pokemonName: string,
  pokemonNameLike: string,
}>;

type FindUserItemsOptions = Partial<{
  where: FindUserItemsWhere,
}>

type FindUserItemsWithPaginationOptions = FindUserItemsOptions & {
  paginationOptions: PaginationOptions,
}

export const mapFindUserItemsWhereToSQL = (
  where: FindUserItemsWhere
): Optional<SQL> => {
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
  );
};

export const mapUserItemsRowToEntity = (
  row: Record<'user_items' | 'users' | 'pokemons', any>,
) => {
  return {
    ...row.user_items,
    user: row.users,
    pokemon: row.pokemons,
  };
};

@Injectable()
export class UserItemsService {
  public constructor(
    @InjectDatabase()
    private readonly db: Database,
  ) {}

  private baseSelectBuilder(
    findUserItemsOptions: FindUserItemsOptions,
  ) {
    const { where = {} } = findUserItemsOptions;

    return this.db
      .select()
      .from(userItemsTable)
      .innerJoin(usersTable, eq(userItemsTable.userId, usersTable.id))
      .innerJoin(pokemonsTable, eq(userItemsTable.pokemonId, pokemonsTable.id))
      .where(mapFindUserItemsWhereToSQL(where));
  }

  public async findUserItems(
    findUserItemsOptions: FindUserItemsOptions,
  ): Promise<Array<UserItemEntity>> {
    return this
      .baseSelectBuilder(findUserItemsOptions)
      .then((rows) => rows.map((row) => mapUserItemsRowToEntity(row)));
  }

  public async findUserItemsWithPagination(
    findUserItemsWithPaginationOptions: FindUserItemsWithPaginationOptions,
  ): Promise<PaginatedArray<UserItemEntity>> {
    const { paginationOptions: { page, limit } } = findUserItemsWithPaginationOptions;
    // TODO: check for boundaries
    const offset = (page - 1) * limit;

    return this
      .baseSelectBuilder(findUserItemsWithPaginationOptions)
      .offset(offset)
      .limit(limit)
      .then((rows) => mapArrayToPaginatedArray(
        rows.map((row) => mapUserItemsRowToEntity(row)),
        { page, limit },
      ));
  }

  public async findUserItem(
    findUserItemsOptions: FindUserItemsOptions,
  ): Promise<Nullable<UserItemEntity>> {
    return this
      .baseSelectBuilder(findUserItemsOptions)
      .limit(1)
      .then(([row]) => (
        row
          ? mapUserItemsRowToEntity(row)
          : null
      ));
  }

  public async createUserItem(
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

  public async updateUserItems(
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

  public async updateUserItem(
    userItem: UserItemEntity,
    values: UpdateUserItemEntityValues,
    tx?: Transaction,
  ): Promise<UserItemEntity> {
    return this
      .updateUserItems([userItem], values, tx)
      .then(([userItem]) => userItem!);
  }

  public async deleteUserItem(
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
