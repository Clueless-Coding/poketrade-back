import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { UsersUseCase } from 'src/core/use-cases/users.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserEntity } from 'src/infra/postgres/entities/user.entity';
import { User } from '../decorators/user.decorator';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { InjectMapper, MapInterceptor } from '@automapper/nestjs';
import { UserOutputDTO } from '../dtos/users/user.output.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  public constructor(
    private readonly usersUseCase: UsersUseCase
  ) {}

  @ApiOkResponse({ type: UserOutputDTO })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(MapInterceptor(UserEntity, UserOutputDTO))
  public async getMe(@User() user: UserEntity) {
    return user;
  }
}
