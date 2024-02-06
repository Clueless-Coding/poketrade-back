import { Injectable } from '@nestjs/common';
import { IUsersRepository } from '../repositories/users.repository';
import { PaginatedArray, UUIDv4 } from 'src/common/types';
import { GetUsersInputDTO } from 'src/api/dtos/users/get-users.input.dto';
import { UserEntity } from '../entities/user.entity';
import { PaginationOptionsInputDTO } from 'src/api/dtos/pagination.input.dto';

@Injectable()
export class UsersService {
  public constructor(
    private readonly usersRepository: IUsersRepository,
  ) {}

  public getUsersWithPagination(
    dto: GetUsersInputDTO,
    paginationOptionsDTO: PaginationOptionsInputDTO,
  ): Promise<PaginatedArray<UserEntity>> {
    return this.usersRepository.findUsersWithPagination({
      paginationOptions: paginationOptionsDTO,
      where: dto,
    });
  }

  public getUserById(id: UUIDv4) {
    return this.usersRepository.findUserById({ id });
  }
}
