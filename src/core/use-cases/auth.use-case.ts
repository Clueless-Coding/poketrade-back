import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserInputDTO } from 'src/api/dtos/auth/register-user.input.dto';
import { JWT } from 'src/common/types';
import { UsersUseCase } from './users.use-case';
import * as bcrypt from 'bcrypt';
import { UserEntity } from 'src/infra/postgres/tables';

@Injectable()
export class AuthUseCase {
  public constructor(
    private readonly jwtService: JwtService,
    private readonly usersUseCase: UsersUseCase,
  ) {}

  private async generateAccessToken(user: UserEntity): Promise<JWT> {
    return this.jwtService.signAsync({}, { subject: user.id }) as Promise<JWT>;
  }

  public async loginUser(user: UserEntity): Promise<{ accessToken: JWT }> {
    const accessToken = await this.generateAccessToken(user);

    return { accessToken };
  }

  public async registerUser(
    dto: RegisterUserInputDTO
  ): Promise<{ user: UserEntity, accessToken: JWT }> {
    if (dto.password !== dto.confirmPassword) {
      throw new HttpException('Passwords does not match', HttpStatus.BAD_REQUEST);
    }

    if (await this.usersUseCase.checkIfUserExists({ name: dto.username })) {
      throw new HttpException('User with this name already exists', HttpStatus.CONFLICT);
    }

    const user = await this.usersUseCase.createUserByRegistration({
      name: dto.username,
      hashedPassword: await bcrypt.hash(dto.password, 10),
    });

    const accessToken = await this.generateAccessToken(user);

    return { user, accessToken };
  }
}
