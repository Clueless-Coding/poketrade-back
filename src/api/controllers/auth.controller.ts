import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthUseCase } from 'src/core/use-cases/auth.use-case';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { User } from '../decorators/user.decorator';
import { LoginUserOutputDTO } from '../dtos/auth/login-user.output.dto';
import { LoginUserInputDTO } from '../dtos/auth/login-user.input.dto';
import { RegisterUserInputDTO } from '../dtos/auth/register-user.input.dto';
import { RegisterUserOutputDTO } from '../dtos/auth/register-user.output.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserEntity } from 'src/infra/postgres/tables';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { UserOutputDTO } from '../dtos/users/user.output.dto';

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
    const { accessToken } = await this.authUseCase.loginUser(user);

    return {
      user: this.mapper.map<UserEntity, UserOutputDTO>(user, 'UserEntity', 'UserOutputDTO'),
      accessToken,
    };
  }

  @ApiCreatedResponse({ type: RegisterUserOutputDTO })
  @Post('register')
  public async registerUser(
    @Body() dto: RegisterUserInputDTO,
  ): Promise<RegisterUserOutputDTO> {
    const { user, accessToken } = await this.authUseCase.registerUser(dto);

    return {
      user: this.mapper.map<UserEntity, UserOutputDTO>(user, 'UserEntity', 'UserOutputDTO'),
      accessToken,
    };
  }
}
