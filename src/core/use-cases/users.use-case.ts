import { Injectable } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserInputDTO } from 'src/api/dtos/users/create-user.input.dto';
import { UserEntity } from 'src/infra/postgres/entities/user.entity';
import { PokemonEntity } from 'src/infra/postgres/entities/pokemon.entity';
import { UpdateUserInputDTO } from 'src/api/dtos/users/update-user.input.dto';

@Injectable()
export class UsersUseCase {
  public constructor(private readonly usersService: UsersService) {}

  public async createUser(dto: CreateUserInputDTO): Promise<UserEntity> {
    return this.usersService.createOne(dto);
  }

  public async updateUser(user: UserEntity, dto: UpdateUserInputDTO): Promise<UserEntity> {
    return this.usersService.updateOne(user, dto);
  }

  public async addPokemonToCollection(user: UserEntity, pokemon: PokemonEntity) {
    const isDuplicate = user.pokemons.some((x) => x.id === pokemon.id);

    if (!isDuplicate) {
      user = await this.usersService.updateOne(
        user,
        { pokemons: [...user.pokemons, pokemon] },
      )
    }

    return { user, isDuplicate };
  }
}
