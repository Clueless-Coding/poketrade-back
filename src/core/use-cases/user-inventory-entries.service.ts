import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { UUIDv4 } from 'src/common/types';
import { PokemonModel } from 'src/infra/postgres/entities/pokemon.entity';
import { UserInventoryEntryEntity, UserInventoryEntryModel } from 'src/infra/postgres/entities/user-inventory-entry.entity';
import { UserModel } from 'src/infra/postgres/entities/user.entity';
import { FindEntityRelationsOptions } from 'src/infra/postgres/other/types';
import { UserInventoryEntriesService } from '../services/user-inventory-entries.service';

@Injectable()
export class UserInventoryEntriesUseCase {
  public constructor(
    private readonly userInventoryEntriesService: UserInventoryEntriesService,
  ) {}

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
