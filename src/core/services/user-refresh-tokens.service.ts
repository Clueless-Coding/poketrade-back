import { Injectable } from '@nestjs/common';
import { SQL, and, eq, gt, sql } from 'drizzle-orm';
import { JWT, Nullable, Optional, UUIDv4 } from 'src/common/types';
import { InjectDatabase } from 'src/infra/decorators/inject-database.decorator';
import { Database, Transaction } from 'src/infra/postgres/other/types';
import { CreateUserRefreshTokenEntityValues, UserEntity, UserRefreshTokenEntity, userRefreshTokensTable, usersTable } from 'src/infra/postgres/tables';
import { hashRefreshToken } from 'src/common/helpers/hash-refresh-token.helper';
import { DatabaseError } from 'pg';

type FindUserRefreshTokensWhere = Partial<{
  userId: UUIDv4,
  refreshToken: JWT,
}>

type FindUserRefreshTokensOptions = Partial<{
  where: FindUserRefreshTokensWhere,
}>;

export const mapFindUserRefreshTokensWhereToSQL = (
  where: FindUserRefreshTokensWhere,
): Optional<SQL> => {
  return and(
    where.userId !== undefined ? eq(userRefreshTokensTable.userId, where.userId) : undefined,
    where.refreshToken !== undefined
      ? eq(userRefreshTokensTable.hashedRefreshToken, hashRefreshToken(where.refreshToken))
      : undefined,
  );
}

export const mapUserRefreshTokensRowToEntity = (
  row: Record<'user_refresh_tokens' | 'users', any>,
) => ({
    ...row.user_refresh_tokens,
    user: row.users,
});

@Injectable()
export class UserRefreshTokensService {
  public constructor(
    @InjectDatabase()
    private readonly db: Database,
  ) {}

  private baseSelectBuilder(
    findUserRefreshTokensOptions: FindUserRefreshTokensOptions,
  ) {
    const { where = {} } = findUserRefreshTokensOptions;

    return this.db
      .select()
      .from(userRefreshTokensTable)
      .innerJoin(usersTable, eq(userRefreshTokensTable.userId, usersTable.id))
      .where(mapFindUserRefreshTokensWhereToSQL(where));
  }

  public async findUserRefreshToken(
    findUserRefreshTokensOptions: FindUserRefreshTokensOptions,
  ): Promise<Nullable<UserRefreshTokenEntity>> {
    return this
      .baseSelectBuilder(findUserRefreshTokensOptions)
      .limit(1)
      .then(([row]) => row
        ? mapUserRefreshTokensRowToEntity(row)
        : null);
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
