import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserInputDTO } from 'src/api/dtos/auth/register-user.input.dto';
import { JWT } from 'src/common/types';
import { UserEntity } from '../entities/user.entity';
import { IUserRefreshTokensRepository } from '../repositories/user-refresh-tokens.repository';
import ms from 'ms';
import { addMilliseconds } from 'date-fns';
import { ConfigService } from '@nestjs/config';
import { EnvVariables } from 'src/infra/config/env.config';
import { IUsersRepository } from '../repositories/users.repository';
import { AppConflictException, AppValidationException } from '../exceptions';

type AuthTokens = { accessToken: JWT, refreshToken: JWT };

@Injectable()
export class AuthService {
  public constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvVariables>,
    private readonly usersRepository: IUsersRepository,
    private readonly userRefreshTokensRepository: IUserRefreshTokensRepository,
  ) {}

  private async generateAccessToken(user: UserEntity): Promise<JWT> {
    const secret = this.configService.getOrThrow('JWT_ACCESS_SECRET', { infer: true });
    const expiresIn = this.configService.getOrThrow('JWT_ACCESS_EXPIRES_IN', { infer: true });

    return this.jwtService.signAsync({}, {
      secret,
      subject: user.id,
      expiresIn,
    }) as Promise<JWT>;
  }

  private async generateRefreshToken(user: UserEntity): Promise<JWT> {
    const secret = this.configService.getOrThrow('JWT_REFRESH_SECRET', { infer: true });
    const expiresIn = this.configService.getOrThrow('JWT_REFRESH_EXPIRES_IN', { infer: true });

    const refreshToken = (await this.jwtService.signAsync({}, {
      secret,
      subject: user.id,
      expiresIn,
    })) as JWT;

    const expiresAt = addMilliseconds(new Date(), ms(expiresIn));
    await this.userRefreshTokensRepository.createUserRefreshToken({
      user,
      refreshToken,
      expiresAt,
    });

    return refreshToken;
  }

  private async generateTokens(
    user: UserEntity
  ): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user),
      this.generateRefreshToken(user),
    ]);

    return { accessToken, refreshToken };
  }

  public async loginUser(
    user: UserEntity,
  ): Promise<AuthTokens> {
    return this.generateTokens(user);
  }

  public async registerUser(
    dto: RegisterUserInputDTO
  ): Promise<{ user: UserEntity } & AuthTokens> {
    const { username, password, confirmPassword } = dto;

    if (password !== confirmPassword) {
      throw new AppValidationException('Passwords does not match');
    }

    if (await this.usersRepository.userExists({ name: username })) {
      throw new AppConflictException('User with this name already exists');
    }

    const user = await this.usersRepository.createUser({
      name: username,
      password,
    });

    const tokens = await this.generateTokens(user);

    return { user, ...tokens };
  }

  public async logoutUser(
    user: UserEntity,
    refreshToken: JWT,
  ): Promise<void> {
    const userRefreshToken = await this.userRefreshTokensRepository.findUserRefreshToken({
      where: {
        userId: user.id,
        refreshToken,
      }
    });

    if (!userRefreshToken) {
      throw new AppConflictException('Could not log out (refreshToken not found)');
    }

    await this.userRefreshTokensRepository.deleteUserRefreshToken(userRefreshToken);
  }

  public async refreshTokens(
    user: UserEntity,
    oldRefreshToken: JWT,
  ): Promise<AuthTokens> {
    const userRefreshToken = await this.userRefreshTokensRepository.findUserRefreshToken({
      where: {
        userId: user.id,
        refreshToken: oldRefreshToken,
      }
    });

    if (!userRefreshToken) {
      throw new AppConflictException('Could not refresh tokens (refreshToken not found)');
    }

    const [accessToken, newRefreshToken] = await Promise.all([
      this.generateAccessToken(user),
      this.generateRefreshToken(user),
      this.userRefreshTokensRepository.deleteUserRefreshToken(userRefreshToken),
    ]);

    return { accessToken, refreshToken: newRefreshToken };
  }
}
