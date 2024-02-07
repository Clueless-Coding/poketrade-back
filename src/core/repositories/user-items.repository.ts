import { PaginatedArray, UUIDv4 } from 'src/common/types';
import { UserEntity } from '../entities/user.entity';
import { CreateUserItemEntityValues, UpdateUserItemEntityValues, UserItemEntity } from '../entities/user-item.entity';
import {
  FindEntitiesOptions,
  FindEntityOptions,
  FindEntitiesWithPaginationOptions,
  FindEntityByIdOptions,
  FindEntitiesByIdsOptions,
} from '../types';

export type FindUserItemsWhere = Partial<{
  userId: UUIDv4,
  itemId: UUIDv4,
  itemIds: Array<UUIDv4>,
  userName: string,
  userNameLike: string,
}>;

export abstract class IUserItemsRepository {
  public abstract findUserItems(
    findUserItemsOptions: FindEntitiesOptions<FindUserItemsWhere>
  ): Promise<Array<UserItemEntity>>;

  public abstract findUserItemsByItemIds(
    options: FindEntitiesByIdsOptions<UUIDv4>,
  ): Promise<Array<UserItemEntity>>;

  public abstract findUserItemsWithPagination(
    options: FindEntitiesWithPaginationOptions<FindUserItemsWhere>,
  ): Promise<PaginatedArray<UserItemEntity>>;

  public abstract findUserItem(
    options: FindEntityOptions<FindUserItemsWhere>,
  ): Promise<UserItemEntity>;

  public abstract findUserItemByItemId(
    options: FindEntityByIdOptions<UUIDv4>,
  ): Promise<UserItemEntity>;

  public abstract createUserItem(
    values: CreateUserItemEntityValues,
    tx?: unknown,
  ): Promise<UserItemEntity>;

  public abstract updateUserItems(
    userItems: Array<UserItemEntity>,
    values: UpdateUserItemEntityValues,
    tx?: unknown,
  ): Promise<Array<UserItemEntity>>;

  public abstract transferUserItemsToAnotherUser(
    fromUserItems: Array<UserItemEntity>,
    toUser: UserEntity,
    tx?: unknown,
  ): Promise<Array<UserItemEntity>>;

  public abstract updateUserItem(
    userItem: UserItemEntity,
    values: UpdateUserItemEntityValues,
    tx?: unknown,
  ): Promise<UserItemEntity>;

  public abstract deleteUserItem(
    userItem: UserItemEntity,
    tx?: unknown,
  ): Promise<UserItemEntity>;
}
