import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Nullable } from 'src/common/types';
import { UserEntity, UserModel, CreateUserEntityFields, UpdateUserEntityFields } from 'src/infra/postgres/entities/user.entity';
import { FindEntityRelationsOptions } from 'src/infra/postgres/other/types';
import { FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  public constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  public async preload<
    T extends FindEntityRelationsOptions<UserEntity> = {},
  >(
    user: UserModel,
    relations?: T,
  ): Promise<UserModel<T>> {
    return this.findOne({ id: user.id }, relations).then(user => user!);
  }

  public async findOne<
    T extends FindEntityRelationsOptions<UserEntity> = {},
  >(
    where?: FindOptionsWhere<UserEntity>,
    relations?: T,
  ): Promise<Nullable<UserModel<T>>> {
    return this.usersRepository.findOne({
      where,
      relations,
    }) as Promise<Nullable<UserModel<T>>>;
  }

  public async createOne(fields: CreateUserEntityFields): Promise<UserModel> {
    const user = this.usersRepository.create(fields);

    return this.usersRepository.save(user);
  }

  public async updateOne<
    T extends FindEntityRelationsOptions<UserEntity> = {},
  >(
    user: UserModel<T>,
    fields: UpdateUserEntityFields,
  ): Promise<UserModel<T>> {
    const updatedUser = this.usersRepository.merge(
      user as unknown as UserEntity,
      fields
    );

    return this.usersRepository.save(updatedUser) as unknown as Promise<UserModel<T>>;
  }
}
