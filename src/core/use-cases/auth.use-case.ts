import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginOutputDTO } from 'src/api/dtos/auth/login.output.dto';
import { RegisterInputDTO } from 'src/api/dtos/auth/register.input.dto';
import { RegisterOutputDTO } from 'src/api/dtos/auth/register.output.dto';
import { JWT, UserTokenPayload } from 'src/common/types';
import { UserModel } from 'src/infra/postgres/entities/user.entity';
import { UsersUseCase } from './users.use-case';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthUseCase {
  public constructor(
    private readonly jwtService: JwtService,
    private readonly usersUseCase: UsersUseCase,
  ) {}

  private async generateAccessToken(user: UserModel): Promise<JWT> {
    const userTokenPayload: UserTokenPayload = {
      id: user.id,
    };

    return this.jwtService.signAsync(userTokenPayload) as Promise<JWT>;
  }

  public async login(user: UserModel): Promise<LoginOutputDTO> {
    const accessToken = await this.generateAccessToken(user);

    return { accessToken };
  }

  public async register(dto: RegisterInputDTO): Promise<RegisterOutputDTO> {
    if (dto.password !== dto.confirmPassword) {
      throw new HttpException('Passwords does not match', HttpStatus.BAD_REQUEST);
    }

    if (await this.usersUseCase.checkIfUserExistsByName(dto.username)) {
      throw new HttpException('User with this name already exists', HttpStatus.CONFLICT);
    }

    const user = await this.usersUseCase.createUser({
      name: dto.username,
      hashedPassword: await bcrypt.hash(dto.password, 10),
    });

    const accessToken = await this.generateAccessToken(user);

    return { accessToken };
  }
}
