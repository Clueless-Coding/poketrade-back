import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Nullable } from 'src/common/types';
import { CreateUserInventoryEntryEntityFields, UserInventoryEntryEntity, UserInventoryEntryModel } from 'src/infra/postgres/entities/user-inventory-entry.entity';
import { FindEntityRelationsOptions } from 'src/infra/postgres/other/types';
import { FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class UserInventoryEntriesService {
  public constructor(
    @InjectRepository(UserInventoryEntryEntity)
    private readonly userInventoryEntriesRepository: Repository<UserInventoryEntryEntity>,
  ) {}

  public async findOne<
    T extends FindEntityRelationsOptions<UserInventoryEntryEntity> = {},
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
    T extends FindEntityRelationsOptions<UserInventoryEntryEntity> = {},
  >(
    where?: FindOptionsWhere<UserInventoryEntryEntity>,
    relations?: T,
  ): Promise<Array<UserInventoryEntryModel<T>>> {
    return this.userInventoryEntriesRepository.find(
      { where, relations },
    ) as unknown as Promise<Array<UserInventoryEntryModel<T>>>;
  }

  public async findManyWithPagination<
    T extends FindEntityRelationsOptions<UserInventoryEntryEntity> = {},
  >(
    paginationOptions: IPaginationOptions,
    where?: FindOptionsWhere<UserInventoryEntryEntity>,
    relations?: T,
  ): Promise<Pagination<UserInventoryEntryModel<T>>> {
    return paginate(
      this.userInventoryEntriesRepository,
      paginationOptions,
      { where, relations },
    ) as unknown as Promise<Pagination<UserInventoryEntryModel<T>>>;
  }

  public async createOne(
    fields: CreateUserInventoryEntryEntityFields,
  ): Promise<UserInventoryEntryModel<{ user: true, pokemon: true }>> {
    const userInventoryEntry = this.userInventoryEntriesRepository.create(fields);

    return this.userInventoryEntriesRepository.save(userInventoryEntry);
  }

  public async deleteOne<
    T extends FindEntityRelationsOptions<UserInventoryEntryEntity>,
  >(
    userInventoryEntry: UserInventoryEntryModel<T>,
  ): Promise<UserInventoryEntryModel<T>> {
    return this.userInventoryEntriesRepository.remove(
      userInventoryEntry as unknown as UserInventoryEntryEntity
    ) as unknown as Promise<UserInventoryEntryModel<T>>;
  }
}
