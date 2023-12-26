import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UserEntity, UserModel } from 'src/infra/postgres/entities/user.entity';
import { PokemonModel } from 'src/infra/postgres/entities/pokemon.entity';
import { CreateUserInputDTO } from 'src/api/dtos/users/create-user.input.dto';
import { UpdateUserInputDTO } from 'src/api/dtos/users/update-user.input.dto';
import { FindOptionsRelations } from 'typeorm';
import { UserInventoryEntryModel } from 'src/infra/postgres/entities/user-inventory-entry.entity';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { UUIDv4 } from 'src/common/types';

@Injectable()
export class UsersUseCase {
  public constructor(private readonly usersService: UsersService) {}

  public async findUserById(
    id: UUIDv4,
  ): Promise<UserModel> {
    const user = await this.usersService.findOne({ id });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  public async findUserInventoryById(
    id: UUIDv4,
    paginationOptions: IPaginationOptions
  ): Promise<Pagination<UserInventoryEntryModel<{ pokemon: true }>>> {
    const user = await this.findUserById(id);

    return this.getUserInventory(user, paginationOptions);
  }

  public async getUserInventory(
    user: UserModel,
    paginationOptions: IPaginationOptions,
  ): Promise<Pagination<UserInventoryEntryModel<{ pokemon: true }>>> {
    return this.usersService.findOneInventory(
      paginationOptions,
      { user: { id: user.id } },
      { pokemon: true },
    );
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

  public async addPokemonToInventory(
    user: UserModel,
    pokemon: PokemonModel
  ): Promise<UserInventoryEntryModel<{ user: true, pokemon: true }>> {
    return this.usersService.addPokemonToInventory({ user, pokemon });
  }
}
