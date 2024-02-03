import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from 'src/core/repositories/users.repository';
import { UserEntity } from 'src/infra/postgres/tables';
import { Nullable } from 'src/common/types';
import { AppAuthException } from 'src/core/exceptions';

@Injectable()
export class LocalAuthStrategy extends PassportStrategy(Strategy) {
  public constructor(private readonly usersRepository: UsersRepository) {
    super();
  }

  public async validate(username: string, password: string) {
    let user: Nullable<UserEntity> = null;
    try {
      user = await this.usersRepository.findUser({ where: { name: username } });
    } catch (error) {
      throw new AppAuthException('Wrong username');
    }

    if (!(await bcrypt.compare(password, user.hashedPassword))) {
      throw new AppAuthException('Wrong password');
    }

    return user;
  }
}
