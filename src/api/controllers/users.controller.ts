import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersUseCase } from 'src/core/use-cases/users.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserEntity, UserModel } from 'src/infra/postgres/entities/user.entity';
import { User } from '../decorators/user.decorator';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserOutputDTO } from '../dtos/users/user.output.dto';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  public constructor(
    @InjectMapper()
    private readonly mapper: Mapper,

    private readonly usersUseCase: UsersUseCase
  ) {}

  @ApiOkResponse({ type: UserOutputDTO })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  public async getMe(@User() user: UserModel) {
    // TODO: Get rid of this preload and create a separate route for example: me/pokemons.
    // That returns all pokemons of the user with pagination
    const userWithPokemons = await this.usersUseCase.preload(user, ['pokemons']);

    return this.mapper.map(userWithPokemons, UserEntity, UserOutputDTO)
  }
}
