import { Injectable } from '@nestjs/common';
import { Database, Transaction } from 'src/infra/postgres/types';
import { InjectDatabase } from 'src/infra/ioc/decorators/inject-database.decorator';
import { Optional, PaginatedArray, UUIDv4 } from 'src/common/types';
import { pokemonsTable, userItemsTable, usersTable } from 'src/infra/postgres/tables';
import { UserItemEntity, CreateUserItemEntityValues, UpdateUserItemEntityValues} from 'src/core/entities/user-item.entity';
import { UserEntity } from 'src/core/entities/user.entity';
import { and, eq, inArray, like, SQL } from 'drizzle-orm';
import { mapArrayToPaginatedArray } from 'src/common/helpers/map-array-to-paginated-array.helper';
import { zip } from 'lodash';
import { AppConflictException, AppEntityNotFoundException } from 'src/core/exceptions';
import {
  FindEntitiesOptions,
  FindEntityOptions,
  FindEntitiesWithPaginationOptions,
  FindEntityByIdOptions,
  FindEntitiesByIdsOptions,
} from 'src/core/types';
import { FindUserItemsWhere, IUserItemsRepository } from 'src/core/repositories/user-items.repository';

export const mapUserItemsRowToEntity = (
  row: Record<'user_items' | 'users' | 'pokemons', any>,
): UserItemEntity => {
  return {
    ...row.user_items,
    user: row.users,
    pokemon: row.pokemons,
  };
};

@Injectable()
export class UserItemsRepository implements IUserItemsRepository {
  public constructor(
    @InjectDatabase()
    private readonly db: Database,
  ) {}

  private mapWhereToSQL(
    where: FindUserItemsWhere,
  ): Optional<SQL> {
    return and(
      where.id !== undefined ? eq(userItemsTable.id, where.id) : undefined,
      where.ids !== undefined ? inArray(userItemsTable.id, where.ids) : undefined,

      where.userId !== undefined ? eq(userItemsTable.userId, where.userId) : undefined,
      where.userName !== undefined ? eq(usersTable.name, where.userName) : undefined,
      where.userNameLike !== undefined ? like(usersTable.name, `%${where.userNameLike}%`) : undefined,

      where.pokemonId !== undefined ? eq(userItemsTable.pokemonId, where.pokemonId) : undefined,
      where.pokemonName !== undefined ? eq(pokemonsTable.name, where.pokemonName) : undefined,
      where.pokemonNameLike !== undefined ? like(pokemonsTable.name, `%${where.pokemonNameLike}%`) : undefined,
    );
  };

  private baseSelectBuilder(
    options: FindEntitiesOptions<FindUserItemsWhere>,
  ) {
    const { where = {} } = options;

    return this.db
      .select()
      .from(userItemsTable)
      .innerJoin(usersTable, eq(userItemsTable.userId, usersTable.id))
      .innerJoin(pokemonsTable, eq(userItemsTable.pokemonId, pokemonsTable.id))
      .where(this.mapWhereToSQL(where));
  }

  public async findUserItems(
    findUserItemsOptions: FindEntitiesOptions<FindUserItemsWhere>
  ): Promise<Array<UserItemEntity>> {
    return this
      .baseSelectBuilder(findUserItemsOptions)
      .then((rows) => rows.map((row) => mapUserItemsRowToEntity(row)));
  }

  public async findUserItemsByIds(
    options: FindEntitiesByIdsOptions,
  ): Promise<Array<UserItemEntity>> {
    const {
      ids,
      notFoundErrorMessageFn = (id) => `User item (\`${id}\`) not found`,
    } = options;
    if (!ids.length) return [];

    const userItems = await this.findUserItems({
      where: { ids },
    });

    for (const id of ids) {
      const userItem = userItems.some((userItem) => userItem.id === id);

      if (!userItem) {
        throw new AppEntityNotFoundException(notFoundErrorMessageFn(id));
      }
    }

    return userItems;
  }

  public async findUserItemsWithPagination(
    options: FindEntitiesWithPaginationOptions<FindUserItemsWhere>,
  ): Promise<PaginatedArray<UserItemEntity>> {
    const {
      paginationOptions: { page, limit },
    } = options;
    // TODO: check for boundaries
    const offset = (page - 1) * limit;

    return this
      .baseSelectBuilder(options)
      .offset(offset)
      .limit(limit)
      .then((rows) => mapArrayToPaginatedArray(
        rows.map((row) => mapUserItemsRowToEntity(row)),
        { page, limit },
      ));
  }

  public async findUserItem(
    options: FindEntityOptions<FindUserItemsWhere>,
  ): Promise<UserItemEntity> {
    const {
      notFoundErrorMessage = 'User item not found',
    } = options;

     const userItem = await this
      .baseSelectBuilder(options)
      .limit(1)
      .then(([row]) => (
        row ? mapUserItemsRowToEntity(row) : null
      ));

    if (!userItem) {
      throw new AppEntityNotFoundException(notFoundErrorMessage);
    }

    return userItem;
  }

  public async findUserItemById(
    options: FindEntityByIdOptions,
  ): Promise<UserItemEntity> {
    const {
      id,
      notFoundErrorMessageFn = (id) => `User item (\`${id}\`) not found`,
    } = options;

    return this.findUserItem({
      where: { id },
      notFoundErrorMessage: notFoundErrorMessageFn(id),
    });
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

  public async transferUserItemsToAnotherUser(
    fromUserItems: Array<UserItemEntity>,
    toUser: UserEntity,
    tx?: Transaction,
  ): Promise<Array<UserItemEntity>> {
    if (!fromUserItems.length) return [];

    const set = new Set<UUIDv4>(fromUserItems.map(({ user }) => user.id));
    if (set.size > 1) {
      throw new AppConflictException('All of the items must have the same user');
    }

    const fromUserId = fromUserItems[0]!.user.id;
    if (fromUserId === toUser.id) {
      throw new AppConflictException('You cannot transfer items to yourself');
    }

    return this.updateUserItems(fromUserItems, { user: toUser }, tx);
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
