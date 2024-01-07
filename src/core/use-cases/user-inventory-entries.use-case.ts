import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { TransactionFor } from 'nest-transact';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { UUIDv4 } from 'src/common/types';
import { PokemonModel } from 'src/infra/postgres/entities/pokemon.entity';
import { QuickSoldUserInventoryEntryModel } from 'src/infra/postgres/entities/quick-sold-user-inventory-entry.entity';
import { UserInventoryEntryEntity, UserInventoryEntryModel } from 'src/infra/postgres/entities/user-inventory-entry.entity';
import { UserModel } from 'src/infra/postgres/entities/user.entity';
import { FindEntityRelationsOptions } from 'src/infra/postgres/other/types';
import { DataSource } from 'typeorm';
import { QuickSoldUserInventoryEntriesService } from '../services/quick-sold-user-inventory-entries.service';
import { UserInventoryEntriesService } from '../services/user-inventory-entries.service';
import { UsersUseCase } from './users.use-case';

@Injectable()
export class UserInventoryEntriesUseCase extends TransactionFor<UserInventoryEntriesUseCase> {
  public constructor(
    private readonly userInventoryEntriesService: UserInventoryEntriesService,
    private readonly quickSoldUserInventoryEntriesService: QuickSoldUserInventoryEntriesService,
    private readonly usersUseCase: UsersUseCase,

    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  public async findUserInventoryEntryById(
    id: UUIDv4
  ): Promise<UserInventoryEntryModel<{ user: true, pokemon: true }>> {
    const userInventoryEntry = await this.userInventoryEntriesService.findOne(
      { id },
      { user: true, pokemon: true },
    );

    if (!userInventoryEntry) {
      throw new HttpException('User inventory entry not found', HttpStatus.NOT_FOUND);
    }

    return userInventoryEntry;
  }

  public async findUserInventoryEntriesByUser(
    user: UserModel,
    paginationOptions: IPaginationOptions,
  ): Promise<Pagination<UserInventoryEntryModel<{ pokemon: true }>>> {
    return this.userInventoryEntriesService.findMany(
      paginationOptions,
      { user: { id: user.id } },
      { pokemon: true },
    );
  }

  public async createUserInventoryEntry(
    user: UserModel,
    pokemon: PokemonModel
  ): Promise<UserInventoryEntryModel<{ user: true, pokemon: true }>> {
    return this.userInventoryEntriesService.createOne({ user, pokemon });
  }

  private async _quickSellUserInventoryEntry(
    user: UserModel,
    userInventoryEntry: UserInventoryEntryModel<{ user: true, pokemon: true }>,
  ): Promise<QuickSoldUserInventoryEntryModel<{ user: true, pokemon: true }>> {
    if (user.id !== userInventoryEntry.user.id) {
      throw new HttpException('You can\'t quick sell someone else\'s pokemon', HttpStatus.CONFLICT);
    }

    const userInventoryEntryId = userInventoryEntry.id;
    const [updatedUser, deletedUserInventoryEntry] = await Promise.all([
      this.usersUseCase.replenishUserBalance(user, userInventoryEntry.pokemon.worth),
      this.deleteUserInventoryEntry(userInventoryEntry),
    ]);

    return this.quickSoldUserInventoryEntriesService.createOne({
      id: userInventoryEntryId,
      user: updatedUser,
      pokemon: deletedUserInventoryEntry.pokemon,
    })
  }

  private async _quickSellUserInventoryEntryById(user: UserModel, id: UUIDv4) {
    const userInventoryEntry = await this.findUserInventoryEntryById(id);

    return this._quickSellUserInventoryEntry(user, userInventoryEntry);
  }

  public async quickSellUserInventoryEntry(
    user: UserModel,
    userInventoryEntry: UserInventoryEntryModel<{ user: true, pokemon: true }>,
    dataSource: DataSource,
  ) {
    return dataSource.transaction((manager) => {
      return this.withTransaction(manager)._quickSellUserInventoryEntry(user, userInventoryEntry);
    });
  }

  public async quickSellUserInventoryEntryById(
    user: UserModel,
    id: UUIDv4,
    dataSource: DataSource,
  ) {
    return dataSource.transaction((manager) => {
      return this.withTransaction(manager)._quickSellUserInventoryEntryById(user, id);
    });
  }

  public async deleteUserInventoryEntry<
    T extends FindEntityRelationsOptions<UserInventoryEntryEntity>,
  >(
    userInventoryEntry: UserInventoryEntryModel<T>,
  ): Promise<UserInventoryEntryModel<T>> {
    return this.userInventoryEntriesService.deleteOne(userInventoryEntry);
  }

  public async deleteUserInventoryEntryById(
    id: UUIDv4,
  ): Promise<UserInventoryEntryModel<{ user: true, pokemon: true }>> {
    const userInventoryEntry = await this.findUserInventoryEntryById(id);

    return this.deleteUserInventoryEntry(userInventoryEntry);
  }
}
