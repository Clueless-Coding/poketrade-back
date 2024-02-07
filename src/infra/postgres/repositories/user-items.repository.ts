import { Injectable } from '@nestjs/common';
import { Database, Transaction } from 'src/infra/postgres/types';
import { InjectDatabase } from 'src/infra/ioc/decorators/inject-database.decorator';
import { Optional, PaginatedArray, UUIDv4 } from 'src/common/types';
import { userItemsTable, usersTable } from 'src/infra/postgres/tables';
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
import { transformPaginationOptions } from 'src/common/helpers/transform-pagination-options.helper';
import { calculateOffsetFromPaginationOptions } from 'src/common/helpers/calculate-offset-from-pagination-options.helper';
import { getTotalPaginationMeta } from 'src/common/helpers/get-total-pagination-meta.helper';
import { itemsTable } from '../tables/items.table';

export const mapUserItemsRowToEntity = (
  row: Record<'user_items' | 'users' | 'items', any>,
): UserItemEntity => {
  return {
    ...row.user_items,
    user: row.users,
    item: row.items,
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
      where.userId !== undefined ? eq(userItemsTable.userId, where.userId) : undefined,
      where.userName !== undefined ? eq(usersTable.name, where.userName) : undefined,
      where.userNameLike !== undefined ? like(usersTable.name, `%${where.userNameLike}%`) : undefined,

      where.itemId !== undefined ? eq(userItemsTable.itemId, where.itemId) : undefined,
      where.itemIds !== undefined ? inArray(userItemsTable.itemId, where.itemIds) : undefined,
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
      .innerJoin(itemsTable, eq(userItemsTable.itemId, itemsTable.id))
      .where(this.mapWhereToSQL(where));
  }

  public async findUserItems(
    findUserItemsOptions: FindEntitiesOptions<FindUserItemsWhere>
  ): Promise<Array<UserItemEntity>> {
    return this
      .baseSelectBuilder(findUserItemsOptions)
      .then((rows) => rows.map((row) => mapUserItemsRowToEntity(row)));
  }

  public async findUserItemsByItemIds(
    options: FindEntitiesByIdsOptions<UUIDv4>,
  ): Promise<Array<UserItemEntity>> {
    const {
      ids: itemIds,
      notFoundErrorMessageFn = (id) => `User item (\`${id}\`) not found`,
    } = options;
    if (!itemIds.length) return [];

    const userItems = await this.findUserItems({
      where: { itemIds },
    });

    for (const itemId of itemIds) {
      const userItem = userItems.some((userItem) => userItem.item.id === itemId);

      if (!userItem) {
        throw new AppEntityNotFoundException(notFoundErrorMessageFn(itemId));
      }
    }

    return userItems;
  }

  public async findUserItemsWithPagination(
    options: FindEntitiesWithPaginationOptions<FindUserItemsWhere>,
  ): Promise<PaginatedArray<UserItemEntity>> {
    const {
      paginationOptions,
      where = {},
    } = options;

    const transformedPaginationOptions = transformPaginationOptions(paginationOptions);

    const { page, limit } = transformedPaginationOptions;
    const offset = calculateOffsetFromPaginationOptions(transformedPaginationOptions);

    const { totalItems, totalPages } = await getTotalPaginationMeta({
      db: this.db,
      table: userItemsTable,
      whereSQL: this.mapWhereToSQL(where),
      limit,
    });

    return this
      .baseSelectBuilder(options)
      .offset(offset)
      .limit(limit)
      .then((rows) => mapArrayToPaginatedArray(
        rows.map((row) => mapUserItemsRowToEntity(row)),
        { page, limit, totalItems, totalPages },
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

  public async findUserItemByItemId(
    options: FindEntityByIdOptions<UUIDv4>,
  ): Promise<UserItemEntity> {
    const {
      id: itemId,
      notFoundErrorMessageFn = (id) => `User item (\`${id}\`) not found`,
    } = options;

    return this.findUserItem({
      where: { itemId },
      notFoundErrorMessage: notFoundErrorMessageFn(itemId),
    });
  }

  public async createUserItem(
    values: CreateUserItemEntityValues,
    tx?: Transaction,
  ): Promise<UserItemEntity> {
    const { user, item } = values;

    return (tx ?? this.db)
      .insert(userItemsTable)
      .values({
        ...values,
        userId: user.id,
        itemId: item.id,
      })
      .returning()
      .then(([userItem]) => ({
        ...userItem!,
        user,
        item,
      }));
  }

  public async updateUserItems(
    userItems: Array<UserItemEntity>,
    values: UpdateUserItemEntityValues,
    tx?: Transaction,
  ): Promise<Array<UserItemEntity>> {
    if (!userItems.length) return [];

    const { user, item, ...restValues } = values;

    return (tx ?? this.db)
      .update(userItemsTable)
      .set({
        ...restValues,
        userId: user?.id,
        itemId: item?.id,
      })
      .where(inArray(userItemsTable.itemId, userItems.map(({ item }) => item.id)))
      .returning()
      .then((updatedUserItems) => zip(userItems, updatedUserItems).map(([userItem, updatedUserItem]) => ({
        ...updatedUserItem!,
        user: user ?? userItem!.user,
        item: item ?? userItem!.item,
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
      .then(([updatedUserItem]) => updatedUserItem!);
  }

  public async deleteUserItem(
    userItem: UserItemEntity,
    tx?: Transaction,
  ): Promise<UserItemEntity> {
    const { user, item } = userItem;

    return (tx ?? this.db)
      .delete(userItemsTable)
      .where(eq(userItemsTable.itemId, userItem.item.id))
      .returning()
      .then(([deletedUserItem]) => ({
        ...deletedUserItem!,
        user,
        item,
      }));
  }
}
