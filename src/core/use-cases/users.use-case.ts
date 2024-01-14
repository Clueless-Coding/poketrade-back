import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UserEntity, UserModel } from 'src/infra/postgres/entities/user.entity';
import { CreateUserInputDTO } from 'src/api/dtos/users/create-user.input.dto';
import { UpdateUserInputDTO } from 'src/api/dtos/users/update-user.input.dto';
import { UUIDv4 } from 'src/common/types';
import { FindEntityRelationsOptions } from 'src/infra/postgres/other/types';
import { FindOptionsWhere, Like } from 'typeorm';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { GetUsersInputDTO } from 'src/api/dtos/users/get-users.input.dto';

@Injectable()
export class UsersUseCase {
  public constructor(
    private readonly usersService: UsersService,
  ) {}

  // TODO: Rename all methods in use cases starting with find to starting with get
  public async findUser(
    where: FindOptionsWhere<UserEntity>,
    errorMessage?: string,
  ): Promise<UserModel> {
    const user = await this.usersService.findOne(where);

    if (!user) {
      throw new HttpException(errorMessage ?? 'User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  public async findUserById(
    id: UUIDv4,
    errorMessageFn?: (id: UUIDv4) => string,
  ): Promise<UserModel> {
    return this.findUser({ id }, errorMessageFn?.(id) ?? `User (\`${id}\`) not found`);
  }

  public async findUsers(
    dto: GetUsersInputDTO,
    paginationOptions: IPaginationOptions
  ): Promise<Pagination<UserModel>> {
    const where: FindOptionsWhere<UserEntity> = {
      ...(dto.nameLike && { name: Like(`%${dto.nameLike}%`) }),
    };

    return this.usersService.findManyWithPagination(
      paginationOptions,
      where,
    );
  }

  public async checkIfUserExistsByName(name: string) {
    return this.usersService.exist({ name });
  }

  public async preload<
    T extends FindEntityRelationsOptions<UserEntity>,
  >(
    user: UserModel,
    relations?: T,
  ): Promise<UserModel<T>> {
    return this.usersService.preload(user, relations);
  }

  public async createUser(dto: CreateUserInputDTO): Promise<UserModel> {
    return this.usersService.createOne(dto);
  }

  public async updateUser<
    T extends FindEntityRelationsOptions<UserEntity>,
  >(
    user: UserModel<T>,
    dto: UpdateUserInputDTO
  ): Promise<UserModel<T>> {
    return this.usersService.updateOne(user, dto);
  }

  public async replenishUserBalance<
    T extends FindEntityRelationsOptions<UserEntity>,
  >(
    user: UserModel<T>,
    amount: number,
  ) {
    return this.updateUser(user, { balance: user.balance + amount });
  }

  public async spendUserBalance<
    T extends FindEntityRelationsOptions<UserEntity>,
  >(
    user: UserModel<T>,
    amount: number,
  ) {
    return this.updateUser(user, { balance: user.balance - amount });
  }
}
