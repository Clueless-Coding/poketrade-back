import { Injectable } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { PaginatedArray } from 'src/common/types';
import { GetUsersInputDTO } from 'src/api/dtos/users/get-users.input.dto';
import { UserEntity } from 'src/infra/postgres/tables';
import { PaginationInputDTO } from 'src/api/dtos/pagination.input.dto';

@Injectable()
export class UsersUseCase {
  public constructor(
    private readonly usersService: UsersService,
  ) {}

  public getUsersWithPagination(
    dto: GetUsersInputDTO,
    paginationDTO: PaginationInputDTO,
  ): Promise<PaginatedArray<UserEntity>> {
    return this.usersService.findUsersWithPagination({
      paginationOptions: paginationDTO,
      where: dto,
    });
  }
}
