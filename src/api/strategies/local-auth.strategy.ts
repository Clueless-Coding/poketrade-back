import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UsersService } from 'src/core/services/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LocalAuthStrategy extends PassportStrategy(Strategy) {
  // TODO: change it to use case
  public constructor(private readonly usersService: UsersService) {
    super();
  }

  public async validate(username: string, password: string) {
    const user = await this.usersService.findOneBy({ name: username });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    if (!(await bcrypt.compare(password, user.hashedPassword))) {
      throw new HttpException('Wrong password', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }
}
