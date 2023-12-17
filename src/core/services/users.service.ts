import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserInputDTO } from 'src/api/dtos/users/create-user.input.dto';
import { UpdateUserInputDTO } from 'src/api/dtos/users/update-user.input.dto';
import { Nullable } from 'src/common/types';
import { PokemonEntity } from 'src/infra/postgres/entities/pokemon.entity';
import { UserEntity } from 'src/infra/postgres/entities/user.entity';
import { FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  public constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  public async findOneBy(where: FindOptionsWhere<UserEntity>): Promise<Nullable<UserEntity>> {
    return this.usersRepository.findOne({
      where,
      relations: {
        pokemons: true,
      },
    });
  }

  public async createOne(dto: CreateUserInputDTO): Promise<UserEntity> {
    const user = this.usersRepository.create(dto);

    return this.usersRepository.save(user);
  }

  public async updateOne(user: UserEntity, dto: UpdateUserInputDTO): Promise<UserEntity> {
    const updatedUser = this.usersRepository.merge(user, dto);

    return this.usersRepository.save(updatedUser);
  }
}
