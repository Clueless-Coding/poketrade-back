import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Nullable } from 'src/common/types';
import { CreateUserInventoryEntryEntityFields, UserInventoryEntryEntity, UserInventoryEntryModel } from 'src/infra/postgres/entities/user-inventory-entry.entity';
import { FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class UserInventoryEntriesService {
  public constructor(
    @InjectRepository(UserInventoryEntryEntity)
    private readonly userInventoryEntriesRepository: Repository<UserInventoryEntryEntity>,
  ) {}

  public async findOne<
    T extends FindOptionsRelations<UserInventoryEntryEntity> = {},
  >(
    where?: FindOptionsWhere<UserInventoryEntryEntity>,
    relations?: T,
  ): Promise<Nullable<UserInventoryEntryModel<T>>> {
    return this.userInventoryEntriesRepository.findOne({
      where,
      relations,
    }) as Promise<Nullable<UserInventoryEntryModel<T>>>;
  }

  public async findMany<
    T extends FindOptionsRelations<UserInventoryEntryEntity> = {},
  >(
    paginationOptions: IPaginationOptions,
    where?: FindOptionsWhere<UserInventoryEntryEntity>,
    relations?: T,
  ): Promise<Pagination<UserInventoryEntryModel<T>>> {
    return paginate(
      this.userInventoryEntriesRepository,
      paginationOptions,
      { where, relations },
    ) as Promise<Pagination<UserInventoryEntryModel<T>>>;
  }

  public async createOne(
    fields: CreateUserInventoryEntryEntityFields,
  ): Promise<UserInventoryEntryModel<{ user: true, pokemon: true }>> {
    const userPokemon = this.userInventoryEntriesRepository.create(fields);

    return this.userInventoryEntriesRepository.save(userPokemon);
  }

  public async deleteOne<
    T extends FindOptionsRelations<UserInventoryEntryEntity>,
  >(
    userInventoryEntry: UserInventoryEntryModel<T>,
  ): Promise<UserInventoryEntryModel<T>> {
    // TODO: deal with @ts-ignore
    // @ts-ignore
    return this.userInventoryEntriesRepository.remove(userInventoryEntry);
  }
}
