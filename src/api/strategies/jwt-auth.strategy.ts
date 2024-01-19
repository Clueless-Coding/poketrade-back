import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserTokenPayload } from 'src/common/types';
import { UsersUseCase } from 'src/core/use-cases/users.use-case';
import { EnvVariables } from 'src/infra/config/validation';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  public constructor(
    private readonly usersService: UsersUseCase,
    configService: ConfigService<EnvVariables>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromHeader('x-access-token'),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
    });
  }

  public async validate(tokenPayload: UserTokenPayload) {
    return this.usersService.getUser({ id: tokenPayload.id }, {
      errorMessage: 'Unauthorized',
      errorStatus: HttpStatus.UNAUTHORIZED,
    });
  }
}
