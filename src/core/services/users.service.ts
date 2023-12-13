import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserInputDTO } from 'src/api/dtos/users/create-user.input.dto';
import { Nullable } from 'src/common/types';
import { UserEntity } from 'src/infra/postgres/entities/user.entity';
import { FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  public constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  public async findOneBy(where: FindOptionsWhere<UserEntity>): Promise<Nullable<UserEntity>> {
    return this.usersRepository.findOne({ where });
  }

  public async createOne(dto: CreateUserInputDTO): Promise<UserEntity> {
    const user = this.usersRepository.create(dto);

    return this.usersRepository.save(user);
  }
}
