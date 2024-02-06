import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from 'src/core/services/auth.service';
import { User } from '../decorators/user.decorator';
import { LoginUserOutputDTO } from '../dtos/auth/login-user.output.dto';
import { LoginUserInputDTO } from '../dtos/auth/login-user.input.dto';
import { RegisterUserInputDTO } from '../dtos/auth/register-user.input.dto';
import { RegisterUserOutputDTO } from '../dtos/auth/register-user.output.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserEntity } from 'src/core/entities/user.entity';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { UserOutputDTO } from '../dtos/users/user.output.dto';
import { RefreshTokenAuthGuard } from '../guards/refresh-token-auth.guard';
import { JWT } from 'src/common/types';
import { RefreshTokensOutputDTO } from '../dtos/auth/refresh-tokens-output.dto';
import { RefreshTokenHeader } from '../decorators/refresh-token-header.decorator';

@ApiTags('Authorization')
@Controller('auth')
export class AuthController {
  public constructor(
    @InjectMapper()
    private readonly mapper: Mapper,
    private readonly authService: AuthService,
  ) {}

  @ApiOkResponse({ type: LoginUserOutputDTO })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async loginUser(
    @Body() dto: LoginUserInputDTO,
  ): Promise<LoginUserOutputDTO> {
    const { user, accessToken, refreshToken } = await this.authService.loginUser(dto);

    return {
      user: this.mapper.map(user, UserEntity, UserOutputDTO),
      accessToken,
      refreshToken,
    };
  }

  @ApiCreatedResponse({ type: RegisterUserOutputDTO })
  @Post('register')
  public async registerUser(
    @Body() dto: RegisterUserInputDTO,
  ): Promise<RegisterUserOutputDTO> {
    const { user, accessToken, refreshToken } = await this.authService.registerUser(dto);

    return {
      user: this.mapper.map(user, UserEntity, UserOutputDTO),
      accessToken,
      refreshToken,
    };
  }

  @ApiOkResponse()
  @ApiBearerAuth('RefreshToken')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenAuthGuard)
  @Post('logout')
  public async logoutUser(
    @User() user: UserEntity,
    @RefreshTokenHeader() refreshToken: JWT,
  ): Promise<void> {
    return this.authService.logoutUser(user, refreshToken);
  }

  @ApiCreatedResponse({ type: RefreshTokensOutputDTO })
  @ApiBearerAuth('RefreshToken')
  @UseGuards(RefreshTokenAuthGuard)
  @Post('refresh')
  public async refreshTokens(
    @User() user: UserEntity,
    @RefreshTokenHeader() oldRefreshToken: JWT,
  ) {
    const {
      accessToken,
      refreshToken: newRefreshToken,
    } = await this.authService.refreshTokens(user, oldRefreshToken);

    return {
      user: this.mapper.map(user, UserEntity, UserOutputDTO),
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
