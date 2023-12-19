import { Injectable } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UserEntityRelations, UserModel } from 'src/infra/postgres/entities/user.entity';
import { PokemonModel } from 'src/infra/postgres/entities/pokemon.entity';
import { CreateUserInputDTO } from 'src/api/dtos/users/create-user.input.dto';
import { UpdateUserInputDTO } from 'src/api/dtos/users/update-user.input.dto';

@Injectable()
export class UsersUseCase {
  public constructor(private readonly usersService: UsersService) {}

  public async preload<T extends UserEntityRelations = never>(
    user: UserModel,
    relations: Array<T> = [],
  ): Promise<UserModel<T>> {
    return this.usersService.preload(user, relations);
  }

  public async createUser(dto: CreateUserInputDTO): Promise<UserModel> {
    return this.usersService.createOne(dto);
  }

  public async updateUser<T extends UserEntityRelations>(user: UserModel<T>, dto: UpdateUserInputDTO): Promise<UserModel<T>> {
    return this.usersService.updateOne(user, dto);
  }

  public async addPokemonToCollection(user: UserModel<'pokemons'>, pokemon: PokemonModel) {
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
