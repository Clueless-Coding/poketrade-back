import { Injectable } from '@nestjs/common';
import { IUsersRepository } from '../repositories/users.repository';
import { PaginatedArray } from 'src/common/types';
import { GetUsersInputDTO } from 'src/api/dtos/users/get-users.input.dto';
import { UserEntity } from '../entities/user.entity';
import { PaginationInputDTO } from 'src/api/dtos/pagination.input.dto';

@Injectable()
export class UsersService {
  public constructor(
    private readonly usersRepository: IUsersRepository,
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
