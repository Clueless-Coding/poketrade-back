import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppAuthException, AppEntityNotFoundException } from 'src/core/exceptions';
import { Nullable, } from 'src/common/types';
import { UserTokenPayload } from '../types';
import { IUsersRepository } from 'src/core/repositories/users.repository';
import { EnvVariables } from 'src/infra/config/env.config';
import { UserEntity } from 'src/core/entities/user.entity';

@Injectable()
export class RefreshTokenAuthStrategy extends PassportStrategy(Strategy, 'refresh-token') {
  public constructor(
    private readonly usersRepository: IUsersRepository,
    configService: ConfigService<EnvVariables>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromHeader('x-refresh-token'),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('JWT_REFRESH_SECRET'),
    });
  }

  public async validate(tokenPayload: UserTokenPayload): Promise<UserEntity> {
    let user: Nullable<UserEntity> = null;
    try {
      user = await this.usersRepository.findUserById({ id: tokenPayload.sub });
    } catch (error) {
      if (error instanceof AppEntityNotFoundException) {
        throw new AppAuthException('Unauthorized');
      }

      throw error;
    }

    return user;
  }
}
