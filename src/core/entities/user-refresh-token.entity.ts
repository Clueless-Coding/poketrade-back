import { AutoMap } from '@automapper/classes';
import { UserEntity } from './user.entity';
import { JWT } from 'src/common/types';

export class UserRefreshTokenEntity {
  @AutoMap(() => UserEntity)
  public readonly user: UserEntity;
  @AutoMap()
  public readonly hashedRefreshToken: string;
  @AutoMap()
  public readonly expiresAt: Date;
}

export type CreateUserRefreshTokenEntityValues = Omit<UserRefreshTokenEntity, 'hashedRefreshToken'> & {
  refreshToken: JWT;
};
