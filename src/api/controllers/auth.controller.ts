import { Body, Controller, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthUseCase } from 'src/core/use-cases/auth.use-case';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { User } from '../decorators/user.decorator';
import { UserEntity } from 'src/infra/postgres/entities/user.entity';
import { LoginOutputDTO } from '../dtos/auth/login.output.dto';
import { LoginInputDTO } from '../dtos/auth/login.input.dto';
import { RegisterInputDTO } from '../dtos/auth/register.input.dto';
import { RegisterOutputDTO } from '../dtos/auth/register.output.dto';

@Controller('auth')
export class AuthController {
  public constructor(private readonly authUseCase: AuthUseCase) {}

  // TODO: For some reason body validation doesn't work. Fix it.
  @Post('login')
  @UseGuards(LocalAuthGuard)
  public async login(
    @Body() _dto: LoginInputDTO,
    @User() user: UserEntity,
  ): Promise<LoginOutputDTO> {
    return this.authUseCase.login(user);
  }

  @Post('register')
  public async register(
    @Body() dto: RegisterInputDTO,
  ): Promise<RegisterOutputDTO> {
    return this.authUseCase.register(dto);
  }
}
