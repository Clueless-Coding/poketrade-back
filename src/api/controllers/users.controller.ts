import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersUseCase } from 'src/core/use-cases/users.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserEntity, UserModel } from 'src/infra/postgres/entities/user.entity';
import { User } from '../decorators/user.decorator';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { UserWithPokemonsOutputDTO } from '../dtos/users/user-with-pokemons.output.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  public constructor(
    @InjectMapper()
    private readonly mapper: Mapper,

    private readonly usersUseCase: UsersUseCase
  ) {}

  @ApiOkResponse({ type: UserWithPokemonsOutputDTO })
  @ApiBearerAuth()
  @Get('me')
  @UseGuards(JwtAuthGuard)
  public async getMe(@User() user: UserModel) {
    // TODO: Get rid of this preload and create a separate route for example: me/pokemons.
    // That returns all pokemons of the user with pagination
    const userWithPokemons = await this.usersUseCase.preload(user, { pokemons: true });

    return this.mapper.map(userWithPokemons, UserEntity, UserWithPokemonsOutputDTO);
  }
}
