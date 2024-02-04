import { Injectable } from '@nestjs/common';
import { SQL, and, eq, gt, sql } from 'drizzle-orm';
import { Nullable, Optional } from 'src/common/types';
import { InjectDatabase } from 'src/infra/ioc/decorators/inject-database.decorator';
import { Database, Transaction } from 'src/infra/postgres/types';
import { userRefreshTokensTable, usersTable } from 'src/infra/postgres/tables';
import { CreateUserRefreshTokenEntityValues, UserRefreshTokenEntity } from 'src/core/entities/user-refresh-token.entity';
import { hashRefreshToken } from 'src/common/helpers/hash-refresh-token.helper';
import { AppEntityNotFoundException } from 'src/core/exceptions';
import { FindEntitiesOptions, FindEntityOptions } from 'src/core/types';
import { FindUserRefreshTokensWhere, IUserRefreshTokensRepository } from 'src/core/repositories/user-refresh-tokens.repository';
import { DatabaseError } from 'pg';

export const mapUserRefreshTokensRowToEntity = (
  row: Record<'user_refresh_tokens' | 'users', any>,
): UserRefreshTokenEntity => ({
    ...row.user_refresh_tokens,
    user: row.users,
});

@Injectable()
export class UserRefreshTokensRepository implements IUserRefreshTokensRepository {
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
    const { user, refreshToken } = values;

    try {
      return await (tx ?? this.db)
        .insert(userRefreshTokensTable)
        .values({
          ...values,
          userId: user.id,
          hashedRefreshToken: hashRefreshToken(refreshToken)
        })
        .returning()
        .then(([userRefreshToken]) => ({
          ...userRefreshToken!,
          user,
        }));
    } catch (error) {
      // NOTE: If multiple refresh tokens got generated at the same time (have the same `iat` and `exp`)
      // Then the database will throw an unique constraint error (because of the primary key)
      // If that happens that means that we already have the refresh token in the database
      // so we can simply fetch it from the database
      if (error instanceof DatabaseError && error.code !== '23505') {
        return this.findUserRefreshToken({
          where: {
            userId: user.id,
            refreshToken,
          },
        });
      } else {
        throw error;
      }
    }
  }

  public async deleteUserRefreshToken(
    userRefreshToken: UserRefreshTokenEntity,
    tx?: Transaction,
  ): Promise<UserRefreshTokenEntity> {
    return (tx ?? this.db)
      .delete(userRefreshTokensTable)
      .where(and(
        eq(userRefreshTokensTable.userId, userRefreshToken.user.id),
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
