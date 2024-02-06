import { Injectable } from '@nestjs/common';
import { Database, Transaction } from 'src/infra/postgres/types';
import { InjectDatabase } from 'src/infra/ioc/decorators/inject-database.decorator';
import { Nullable, Optional, PaginatedArray, UUIDv4 } from 'src/common/types';
import { usersTable } from 'src/infra/postgres/tables';
import { CreateUserEntityValues, UpdateUserEntityValues, UserEntity } from 'src/core/entities/user.entity';
import { and, eq, inArray, like, SQL } from 'drizzle-orm';
import { mapArrayToPaginatedArray } from 'src/common/helpers/map-array-to-paginated-array.helper';
import { AppEntityNotFoundException } from 'src/core/exceptions';
import { FindEntitiesOptions, FindEntitiesWithPaginationOptions, FindEntityByIdOptions, FindEntityOptions } from 'src/core/types';
import { FindUsersWhere, IUsersRepository } from 'src/core/repositories/users.repository';
import { hashUserPassword } from 'src/common/helpers/hash-user-password.helper';
import { transformPaginationOptions } from 'src/common/helpers/transform-pagination-options.helper';
import { calculateOffsetFromPaginationOptions } from 'src/common/helpers/calculate-offset-from-pagination-options.helper';
import { getTotalPaginationMeta } from 'src/common/helpers/get-total-pagination-meta.helper';

@Injectable()
export class UsersRepository implements IUsersRepository {
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
      paginationOptions,
      where = {},
    } = options;

    const transformedPaginationOptions = transformPaginationOptions(paginationOptions);

    const { page, limit } = transformedPaginationOptions;
    const offset = calculateOffsetFromPaginationOptions(transformedPaginationOptions);

    const { totalItems, totalPages } = await getTotalPaginationMeta({
      db: this.db,
      table: usersTable,
      whereSQL: this.mapWhereToSQL(where),
      limit,
    });

    return this
      .baseSelectBuilder(options)
      .offset(offset)
      .limit(limit)
      .then((users) => mapArrayToPaginatedArray(users, { page, limit, totalItems, totalPages }));
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
    options: FindEntityByIdOptions<UUIDv4>,
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
    const { password } = values;

    return (tx ?? this.db)
      .insert(usersTable)
      .values({
        ...values,
        hashedPassword: await hashUserPassword(password),
      })
      .returning()
      .then(([user]) => user!);
  }

  public async updateUser(
    user: UserEntity,
    values: UpdateUserEntityValues,
    tx?: Transaction,
  ): Promise<UserEntity> {
    const { password } = values;

    return (tx ?? this.db)
      .update(usersTable)
      .set({
        ...values,
        ...(password !== undefined 
          ? { hashedPassword: await hashUserPassword(password) } 
          : {})
      })
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
