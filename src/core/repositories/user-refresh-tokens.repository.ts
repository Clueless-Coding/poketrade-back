import { JWT, UUIDv4 } from 'src/common/types';
import { CreateUserRefreshTokenEntityValues, UserRefreshTokenEntity } from '../entities/user-refresh-token.entity';
import { FindEntityOptions } from '../types';

export type FindUserRefreshTokensWhere = Partial<{
  userId: UUIDv4,
  refreshToken: JWT,
}>;

export abstract class IUserRefreshTokensRepository {
  public abstract findUserRefreshToken(
    options: FindEntityOptions<FindUserRefreshTokensWhere>,
  ): Promise<UserRefreshTokenEntity>;

  public abstract createUserRefreshToken(
    values: CreateUserRefreshTokenEntityValues,
    tx?: unknown,
  ): Promise<UserRefreshTokenEntity>;

  public abstract deleteUserRefreshToken(
    userRefreshToken: UserRefreshTokenEntity,
    tx?: unknown,
  ): Promise<UserRefreshTokenEntity>;

  public abstract deleteExpiredUserRefreshTokens(
    tx?: unknown,
  ): Promise<void>;
}
