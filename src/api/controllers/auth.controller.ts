import { Body, Controller, Headers, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthUseCase } from 'src/core/use-cases/auth.use-case';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { User } from '../decorators/user.decorator';
import { LoginUserOutputDTO } from '../dtos/auth/login-user.output.dto';
import { LoginUserInputDTO } from '../dtos/auth/login-user.input.dto';
import { RegisterUserInputDTO } from '../dtos/auth/register-user.input.dto';
import { RegisterUserOutputDTO } from '../dtos/auth/register-user.output.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UserEntity } from 'src/infra/postgres/tables';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { UserOutputDTO } from '../dtos/users/user.output.dto';
import { AccessTokenAuthGuard } from '../guards/access-token-auth.guard';
import { RefreshTokenAuthGuard } from '../guards/refresh-token-auth.guard';
import { JWT } from 'src/common/types';
import { RefreshTokensOutputDTO } from '../dtos/auth/refresh-tokens-output.dto';

@ApiTags('Authorization')
@Controller('auth')
export class AuthController {
  public constructor(
    @InjectMapper()
    private readonly mapper: Mapper,
    private readonly authUseCase: AuthUseCase,
  ) {}

  // TODO: For some reason body validation doesn't work. Fix it.
  @ApiOkResponse({ type: LoginUserOutputDTO })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  public async loginUser(
    @Body() _dto: LoginUserInputDTO,
    @User() user: UserEntity,
  ): Promise<LoginUserOutputDTO> {
    const { accessToken, refreshToken } = await this.authUseCase.loginUser(user);

    return {
      user: this.mapper.map<UserEntity, UserOutputDTO>(user, 'UserEntity', 'UserOutputDTO'),
      accessToken,
      refreshToken,
    };
  }

  @ApiCreatedResponse({ type: RegisterUserOutputDTO })
  @Post('register')
  public async registerUser(
    @Body() dto: RegisterUserInputDTO,
  ): Promise<RegisterUserOutputDTO> {
    const { user, accessToken, refreshToken } = await this.authUseCase.registerUser(dto);

    return {
      user: this.mapper.map<UserEntity, UserOutputDTO>(user, 'UserEntity', 'UserOutputDTO'),
      accessToken,
      refreshToken,
    };
  }

  @ApiOkResponse()
  @ApiSecurity('AccessToken')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenAuthGuard)
  @Post('logout')
  public async logoutUser(
    @User() user: UserEntity,
    @Headers('x-refresh-token') refreshToken: JWT,
  ): Promise<void> {
    return this.authUseCase.logoutUser(user, refreshToken);
  }

  @ApiCreatedResponse({ type: RefreshTokensOutputDTO })
  @ApiSecurity('AccessToken')
  @UseGuards(RefreshTokenAuthGuard)
  @Post('refresh')
  public async refreshTokens(
    @User() user: UserEntity,
    @Headers('x-refresh-token') oldRefreshToken: JWT,
  ) {
    const {
      accessToken,
      refreshToken: newRefreshToken,
    } = await this.authUseCase.refreshTokens(user, oldRefreshToken);

    return {
      user: this.mapper.map<UserEntity, UserOutputDTO>(user, 'UserEntity', 'UserOutputDTO'),
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
