import { Injectable } from '@nestjs/common';
import { SQL, and, eq, gt, sql } from 'drizzle-orm';
import { JWT, Optional, UUIDv4 } from 'src/common/types';
import { InjectDatabase } from 'src/infra/ioc/decorators/inject-database.decorator';
import { Database, Transaction } from 'src/infra/postgres/types';
import { CreateUserRefreshTokenEntityValues, UserRefreshTokenEntity, userRefreshTokensTable, usersTable } from 'src/infra/postgres/tables';
import { hashRefreshToken } from 'src/common/helpers/hash-refresh-token.helper';
import { AppEntityNotFoundException } from '../exceptions';
import { FindEntitiesOptions, FindEntityOptions } from '../types';

export type FindUserRefreshTokensWhere = Partial<{
  userId: UUIDv4,
  refreshToken: JWT,
}>;

export const mapUserRefreshTokensRowToEntity = (
  row: Record<'user_refresh_tokens' | 'users', any>,
): UserRefreshTokenEntity => ({
    ...row.user_refresh_tokens,
    user: row.users,
});

@Injectable()
export class UserRefreshTokensRepository {
  public constructor(
    @InjectDatabase()
    private readonly db: Database,
  ) {}

  private mapWhereToSQL(
    where: FindUserRefreshTokensWhere,
  ): Optional<SQL> {
    return and(
      where.userId !== undefined ? eq(userRefreshTokensTable.userId, where.userId) : undefined,
      where.refreshToken !== undefined
        ? eq(userRefreshTokensTable.hashedRefreshToken, hashRefreshToken(where.refreshToken))
        : undefined,
    );
  }

  private baseSelectBuilder(
    options: FindEntitiesOptions<FindUserRefreshTokensWhere>,
  ) {
    const { where = {} } = options;

    return this.db
      .select()
      .from(userRefreshTokensTable)
      .innerJoin(usersTable, eq(userRefreshTokensTable.userId, usersTable.id))
      .where(this.mapWhereToSQL(where));
  }

  public async findUserRefreshToken(
    options: FindEntityOptions<FindUserRefreshTokensWhere>,
  ): Promise<UserRefreshTokenEntity> {
    const {
      notFoundErrorMessage = 'User refresh token not found',
    } = options;

    const userRefreshToken = await this
      .baseSelectBuilder(options)
      .limit(1)
      .then(([row]) => (
        row ? mapUserRefreshTokensRowToEntity(row) : null
      ));

    if (!userRefreshToken) {
      throw new AppEntityNotFoundException(notFoundErrorMessage);
    }

    return userRefreshToken;
  }

  public async createUserRefreshToken(
    values: CreateUserRefreshTokenEntityValues,
    tx?: Transaction,
  ): Promise<UserRefreshTokenEntity> {
    const { user } = values;

    return (tx ?? this.db)
      .insert(userRefreshTokensTable)
      .values({
        ...values,
        userId: user.id,
      })
      .returning()
      .then(([userRefreshToken]) => ({
        ...userRefreshToken!,
        user,
      }));
  }

  public async deleteUserRefreshToken(
    userRefreshToken: UserRefreshTokenEntity,
    tx?: Transaction,
  ): Promise<UserRefreshTokenEntity> {
    return (tx ?? this.db)
      .delete(userRefreshTokensTable)
      .where(and(
        eq(userRefreshTokensTable.userId, userRefreshToken.userId),
        eq(userRefreshTokensTable.hashedRefreshToken, userRefreshToken.hashedRefreshToken),
      ))
      .returning()
      .then(([deletedUserRefreshToken]) => ({
        ...deletedUserRefreshToken!,
        user: userRefreshToken.user,
      }));
  }

  public async deleteExpiredUserRefreshTokens(
    tx?: Transaction,
  ): Promise<void> {
    await (tx ?? this.db)
      .delete(userRefreshTokensTable)
      .where(gt(sql<Date>`now()`, userRefreshTokensTable.expiresAt));
  }
}
