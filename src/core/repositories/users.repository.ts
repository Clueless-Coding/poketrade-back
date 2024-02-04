import { PaginatedArray, UUIDv4 } from 'src/common/types';
import { CreateUserEntityValues, UpdateUserEntityValues, UserEntity } from 'src/infra/postgres/tables';
import { FindEntitiesOptions, FindEntitiesWithPaginationOptions, FindEntityByIdOptions, FindEntityOptions } from '../types';

export type FindUsersWhere = Partial<{
  id: UUIDv4,
  ids: Array<UUIDv4>,
  name: string,
  nameLike: string,
}>;

export abstract class IUsersRepository {
  public abstract findUsers(
    options: FindEntitiesOptions<FindUsersWhere>,
  ): Promise<Array<UserEntity>>;

  public abstract findUsersWithPagination(
    options: FindEntitiesWithPaginationOptions<FindUsersWhere>,
  ): Promise<PaginatedArray<UserEntity>>;

  public abstract findUser(
    options: FindEntityOptions<FindUsersWhere>,
  ): Promise<UserEntity>;

  public abstract userExists(
    where: FindUsersWhere,
  ): Promise<boolean>;

  public abstract findUserById(
    options: FindEntityByIdOptions,
  ): Promise<UserEntity>;

  public abstract createUser(
    values: CreateUserEntityValues,
    tx?: unknown,
  ): Promise<UserEntity>;

  public abstract updateUser(
    user: UserEntity,
    values: UpdateUserEntityValues,
    tx?: unknown,
  ): Promise<UserEntity>;

  public abstract spendUserBalance(
    user: UserEntity,
    amount: number,
    tx?: unknown,
  ): Promise<UserEntity>;

  public abstract replenishUserBalance(
    user: UserEntity,
    amount: number,
    tx?: unknown,
  ): Promise<UserEntity>;
}
