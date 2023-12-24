import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UserEntity, UserModel } from 'src/infra/postgres/entities/user.entity';
import { PokemonModel } from 'src/infra/postgres/entities/pokemon.entity';
import { CreateUserInputDTO } from 'src/api/dtos/users/create-user.input.dto';
import { UpdateUserInputDTO } from 'src/api/dtos/users/update-user.input.dto';
import { FindOptionsRelations, FindOptionsWhere } from 'typeorm';

@Injectable()
export class UsersUseCase {
  public constructor(private readonly usersService: UsersService) {}

  public async findUser<
    T extends FindOptionsRelations<UserEntity> = {},
  >(
    // TODO: change where to dto and parse it inside this function
    where?: FindOptionsWhere<UserEntity<T>>,
    relations?: T,
  ): Promise<UserModel<T>> {
    const user = await this.usersService.findOne(where, relations);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  public async preload<
    T extends FindOptionsRelations<UserEntity>,
  >(
    user: UserModel,
    relations?: T,
  ): Promise<UserModel<T>> {
    return this.usersService.preload(user, relations);
  }

  public async createUser(dto: CreateUserInputDTO): Promise<UserModel> {
    return this.usersService.createOne(dto);
  }

  public async updateUser<
    T extends FindOptionsRelations<UserEntity>,
  >(
    user: UserModel<T>,
    dto: UpdateUserInputDTO
  ): Promise<UserModel<T>> {
    return this.usersService.updateOne(user, dto);
  }

  public async addPokemonToCollection(
    user: UserModel<{ pokemons: true }>,
    pokemon: PokemonModel
  ): Promise<{ user: UserModel<{ pokemons: true }>; isDuplicate: boolean }> {
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
