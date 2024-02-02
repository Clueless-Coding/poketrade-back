import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserTokenPayload } from 'src/common/types';
import { UsersUseCase } from 'src/core/use-cases/users.use-case';
import { EnvVariables } from 'src/infra/config/validation';
import { UserEntity } from 'src/infra/postgres/tables';

@Injectable()
export class RefreshTokenAuthStrategy extends PassportStrategy(Strategy, 'refresh-token') {
  public constructor(
    private readonly usersUseCase: UsersUseCase,
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
    return this.usersUseCase.getUser({ id: tokenPayload.sub }, {
      errorMessage: 'Unauthorized',
      errorStatus: HttpStatus.UNAUTHORIZED,
    });
  }
}
