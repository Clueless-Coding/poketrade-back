import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserInputDTO } from 'src/api/dtos/users/create-user.input.dto';
import { PaginatedArray, UUIDv4 } from 'src/common/types';
import { Transaction } from 'src/infra/postgres/other/types';
import { GetUsersInputDTO } from 'src/api/dtos/users/get-users.input.dto';
import { UserEntity } from 'src/infra/postgres/tables';
import { PaginationInputDTO } from 'src/api/dtos/pagination.input.dto';

@Injectable()
export class UsersUseCase {
  public constructor(
    private readonly usersService: UsersService,
  ) {}

  public async getUser(
    where: Partial<{ id: UUIDv4, name: string }> = {},
    options: Partial<{
      errorMessage: string;
      errorStatus: HttpStatus;
    }> = {},
  ): Promise<UserEntity> {
    const {
      errorMessage = 'User not found',
      errorStatus = HttpStatus.NOT_FOUND,
    } = options;
    const user = await this.usersService.findOne({
      where,
    });

    if (!user) {
      throw new HttpException(errorMessage, errorStatus);
    }

    return user;
  }

  public async getUserById(
    id: UUIDv4,
    options: {
      errorMessageFn?: (id: UUIDv4) => string,
      errorStatus?: HttpStatus,
    } = {},
  ): Promise<UserEntity> {
    const {
      errorMessageFn = (id) => `User (\`${id}\`) not found`,
      errorStatus = HttpStatus.NOT_FOUND,
    } = options;
    return this.getUser({ id }, {
      errorMessage: errorMessageFn(id),
      errorStatus,
    });
  }

  public getUsersWithPagination(
    dto: GetUsersInputDTO,
    paginationDTO: PaginationInputDTO,
  ): Promise<PaginatedArray<UserEntity>> {
    return this.usersService.findManyWithPagination({
      paginationOptions: paginationDTO,
      where: dto,
    });
  }

  public async checkIfUserExists(
    where: Partial<{ id: UUIDv4, name: string }> = {},
  ): Promise<boolean> {
    return this.usersService.exists({
      where
    });
  }

  public async createUser(
    dto: CreateUserInputDTO,
    tx?: Transaction,
  ) {
    return this.usersService.createOne(dto, tx);
  }

  public async replenishUserBalance(
    user: UserEntity,
    amount: number,
    tx?: Transaction,
  ): Promise<UserEntity> {
    return this.usersService.updateOne(user, { balance: user.balance + amount }, tx);
  }

  public async spendUserBalance(
    user: UserEntity,
    amount: number,
    tx?: Transaction,
  ): Promise<UserEntity> {
    return this.usersService.updateOne(user, { balance: user.balance - amount }, tx);
  }
}
