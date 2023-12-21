import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserTokenPayload } from 'src/common/types';
import { UsersService } from 'src/core/services/users.service';
import { EnvVariables } from 'src/infra/config/validation';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  public constructor(
    // TODO: change it to use case
    private readonly usersService: UsersService,
    configService: ConfigService<EnvVariables>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
    });
  }

  public async validate(tokenPayload: UserTokenPayload) {
    const user = await this.usersService.findOne({ id: tokenPayload.id });

    if (!user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }
}
