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
  id: UUIDv4,
  ids: Array<UUIDv4>,
  userId: UUIDv4,
  pokemonId: number,
  userName: string,
  userNameLike: string,
  pokemonName: string,
  pokemonNameLike: string,
}>;

export abstract class IUserItemsRepository {
  public abstract findUserItems(
    findUserItemsOptions: FindEntitiesOptions<FindUserItemsWhere>
  ): Promise<Array<UserItemEntity>>;

  public abstract findUserItemsByIds(
    options: FindEntitiesByIdsOptions,
  ): Promise<Array<UserItemEntity>>;

  public abstract findUserItemsWithPagination(
    options: FindEntitiesWithPaginationOptions<FindUserItemsWhere>,
  ): Promise<PaginatedArray<UserItemEntity>>;

  public abstract findUserItem(
    options: FindEntityOptions<FindUserItemsWhere>,
  ): Promise<UserItemEntity>;

  public abstract findUserItemById(
    options: FindEntityByIdOptions,
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
