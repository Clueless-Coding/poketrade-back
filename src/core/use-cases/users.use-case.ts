import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UserEntity, UserModel } from 'src/infra/postgres/entities/user.entity';
import { PokemonModel } from 'src/infra/postgres/entities/pokemon.entity';
import { CreateUserInputDTO } from 'src/api/dtos/users/create-user.input.dto';
import { UpdateUserInputDTO } from 'src/api/dtos/users/update-user.input.dto';
import { DataSource } from 'typeorm';
import { UserInventoryEntryModel } from 'src/infra/postgres/entities/user-inventory-entry.entity';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { UUIDv4 } from 'src/common/types';
import { ModuleRef } from '@nestjs/core';
import { TransactionFor } from 'nest-transact';
import { UserInventoryEntriesUseCase } from './user-inventory-entries.service';
import { FindEntityRelationsOptions } from 'src/infra/postgres/other/types';

@Injectable()
export class UsersUseCase extends TransactionFor<UsersUseCase> {
  public constructor(
    private readonly usersService: UsersService,
    private readonly userInventoryEntriesUseCase: UserInventoryEntriesUseCase,

    module: ModuleRef,
  ) {
    super(module);
  }

  public async findUserById(id: UUIDv4): Promise<UserModel> {
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
    return this.userInventoryEntriesUseCase.findUserInventoryEntriesByUser(user, paginationOptions);
  }

  private async _sellPokemonFromInventory(user: UserModel, id: UUIDv4) {
    const userInventoryEntry = await this.userInventoryEntriesUseCase.findUserInventoryEntryById(id);

    if (user.id !== userInventoryEntry.user.id) {
      throw new HttpException('You can\'t sell someone else\'s pokemon', HttpStatus.CONFLICT);
    }

    const [updatedUser, { pokemon: soldPokemon }] = await Promise.all([
      this.updateUser(
        user,
        { balance: user.balance + userInventoryEntry.pokemon.worth },
      ),
      this.userInventoryEntriesUseCase.deleteUserInventoryEntry(userInventoryEntry),
    ]);

    return { user: updatedUser, soldPokemon };
  }

  public async sellPokemonFromInventory(user: UserModel, id: UUIDv4, dataSource: DataSource) {
    return dataSource.transaction((manager) => {
      return this.withTransaction(manager)._sellPokemonFromInventory(user, id);
    })
  }

  public async preload<
    T extends FindEntityRelationsOptions<UserEntity>,
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
    T extends FindEntityRelationsOptions<UserEntity>,
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
    return this.userInventoryEntriesUseCase.createUserInventoryEntry(user, pokemon);
  }
}
