import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { PaginatedArray } from 'src/common/types';
import { GetUsersInputDTO } from 'src/api/dtos/users/get-users.input.dto';
import { UserEntity } from 'src/infra/postgres/tables';
import { PaginationInputDTO } from 'src/api/dtos/pagination.input.dto';

@Injectable()
export class UsersService {
  public constructor(
    private readonly usersRepository: UsersRepository,
  ) {}

  public getUsersWithPagination(
    dto: GetUsersInputDTO,
    paginationDTO: PaginationInputDTO,
  ): Promise<PaginatedArray<UserEntity>> {
    return this.usersRepository.findUsersWithPagination({
      paginationOptions: paginationDTO,
      where: dto,
    });
  }
}
