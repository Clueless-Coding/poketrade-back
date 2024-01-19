import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import * as bcrypt from 'bcrypt';
import { UsersUseCase } from 'src/core/use-cases/users.use-case';

@Injectable()
export class LocalAuthStrategy extends PassportStrategy(Strategy) {
  public constructor(private readonly usersUseCase: UsersUseCase) {
    super();
  }

  public async validate(username: string, password: string) {
    const user = await this.usersUseCase.getUser({ name: username }, {
      errorMessage: 'Wrong username',
      errorStatus: HttpStatus.UNAUTHORIZED,
    });

    if (!(await bcrypt.compare(password, user.hashedPassword))) {
      throw new HttpException('Wrong password', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }
}
