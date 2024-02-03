import { Injectable } from '@nestjs/common';
import { Database, Transaction } from 'src/infra/postgres/types';
import { InjectDatabase } from 'src/infra/ioc/decorators/inject-database.decorator';
import { Nullable, Optional, PaginatedArray, UUIDv4 } from 'src/common/types';
import { CreateUserEntityValues, UpdateUserEntityValues, UserEntity, usersTable } from 'src/infra/postgres/tables';
import { and, eq, inArray, like, SQL } from 'drizzle-orm';
import { mapArrayToPaginatedArray } from 'src/common/helpers/map-array-to-paginated-array.helper';
import { AppEntityNotFoundException } from '../exceptions';
import { FindEntitiesOptions, FindEntitiesWithPaginationOptions, FindEntityByIdOptions, FindEntityOptions } from '../types';

export type FindUsersWhere = Partial<{
  id: UUIDv4,
  ids: Array<UUIDv4>,
  name: string,
  nameLike: string,
}>;

@Injectable()
export class UsersRepository {
  public constructor(
    @InjectDatabase()
    private readonly db: Database,
  ) {}

  private mapWhereToSQL(
    where: FindUsersWhere,
  ): Optional<SQL> {
    return and(
      where.id !== undefined ? eq(usersTable.id, where.id) : undefined,
      where.ids !== undefined ? inArray(usersTable.id, where.ids) : undefined,
      where.name !== undefined ? eq(usersTable.name, where.name) : undefined,
      where.nameLike !== undefined ? like(usersTable.name, `%${where.nameLike}%`) : undefined,
    );
}

  private baseSelectBuilder(
    options: FindEntitiesOptions<FindUsersWhere>,
  ) {
    const { where = {} } = options;

    return this.db
      .select()
      .from(usersTable)
      .where(this.mapWhereToSQL(where));
  }

  public async findUsers(
    options: FindEntitiesOptions<FindUsersWhere>,
  ): Promise<Array<UserEntity>> {
    return this.baseSelectBuilder(options);
  }

  public async findUsersWithPagination(
    options: FindEntitiesWithPaginationOptions<FindUsersWhere>,
  ): Promise<PaginatedArray<UserEntity>> {
    const {
      paginationOptions: { page, limit },
    } = options;
    // TODO: check for boundaries
    const offset = (page - 1) * limit;

    // TODO: Pass these values to `mapArrayToPaginatedArray`
    // const totalItems = await this.db
    //   .select({
    //     totalItems: count(),
    //   })
    //   .from(usersTable)
    //   .where(this.mapWhereToSQL(where))
    //   .then(([row]) => row!.totalItems);
    // const totalPages = Math.ceil(totalItems / offset);

    return this
      .baseSelectBuilder(options)
      .offset(offset)
      .limit(limit)
      .then((users) => mapArrayToPaginatedArray(users, { page, limit }));
  }

  public async findUser(
    options: FindEntityOptions<FindUsersWhere>,
  ): Promise<UserEntity> {
    const {
      notFoundErrorMessage = 'User not found',
    } = options;

    const user = await this
      .baseSelectBuilder(options)
      .limit(1)
      .then(([user]) => user ?? null);

    if (!user) {
      throw new AppEntityNotFoundException(notFoundErrorMessage);
    }

    return user;
  }

  public async userExists(
    where: FindUsersWhere,
  ): Promise<boolean> {
    let user: Nullable<UserEntity> = null;
    try {
      user = await this.findUser({ where });
    } catch (error) {
      if (error instanceof AppEntityNotFoundException) {
        return false;
      }

      throw error;
    }

    return true;
  }

  public async findUserById(
    options: FindEntityByIdOptions,
  ): Promise<UserEntity> {
    const {
      id,
      notFoundErrorMessageFn = (id) => `User (\`${id}\`) not found`,
    } = options;

    return this.findUser({
      where: { id },
      notFoundErrorMessage: notFoundErrorMessageFn(id),
    });
  }

  public async createUser(
    values: CreateUserEntityValues,
    tx?: Transaction,
  ): Promise<UserEntity> {
    return (tx ?? this.db)
      .insert(usersTable)
      .values(values)
      .returning()
      .then(([user]) => user!);
  }

  public async updateUser(
    user: UserEntity,
    values: UpdateUserEntityValues,
    tx?: Transaction,
  ): Promise<UserEntity> {
    return (tx ?? this.db)
      .update(usersTable)
      .set(values)
      .where(eq(usersTable.id, user.id))
      .returning()
      .then(([updatedUser]) => updatedUser!);
  }

  public async spendUserBalance(
    user: UserEntity,
    amount: number,
    tx?: Transaction,
  ): Promise<UserEntity> {
    return this.updateUser(user, { balance: user.balance - amount }, tx);
  }

  public async replenishUserBalance(
    user: UserEntity,
    amount: number,
    tx?: Transaction,
  ): Promise<UserEntity> {
    return this.updateUser(user, { balance: user.balance + amount }, tx);
  }
}
