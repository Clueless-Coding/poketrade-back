import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserInputDTO } from 'src/api/dtos/users/create-user.input.dto';
import { UpdateUserInputDTO } from 'src/api/dtos/users/update-user.input.dto';
import { UUIDv4 } from 'src/common/types';
import { EntityRelations, entityRelationsToWith, Transaction, UserEntity } from 'src/infra/postgres/other/types';
import { GetUsersInputDTO } from 'src/api/dtos/users/get-users.input.dto';
import { and, eq, ExtractTablesWithRelations, like } from 'drizzle-orm';
import * as tables from 'src/infra/postgres/tables';

@Injectable()
export class UsersUseCase {
  public constructor(
    private readonly usersService: UsersService,
  ) {}

  public async getUser<
    TEntityRelations extends EntityRelations<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>['users']> = {},
  >(
    where: Partial<{ id: UUIDv4, name: string }> = {},
    options: Partial<{
      entityRelations: TEntityRelations;
      errorMessage: string;
      errorStatus: HttpStatus;
    }> = {},
  ): Promise<UserEntity<TEntityRelations>> {
    const user = await this.usersService.findOne({
      where: (table) => and(
        // TODO: Maybe there is a better way to do that
        ...(where.id ? [eq(table.id, where.id)] : []),
        ...(where.name ? [eq(table.name, where.name)] : []),
      ),
      with: entityRelationsToWith(options.entityRelations ?? {}),
    }) as UserEntity<TEntityRelations>;

    if (!user) {
      throw new HttpException(
        options.errorMessage ?? 'User not found',
        options.errorStatus ?? HttpStatus.NOT_FOUND,
      );
    }

    return user;
  }

  public async getUserById<
    TEntityRelations extends EntityRelations<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>['users']> = {},
  >(
    id: UUIDv4,
    config: {
      entityRelations?: TEntityRelations
      errorMessageFn?: (id: UUIDv4) => string,
      errorStatus?: HttpStatus,
    } = {},
  ): Promise<UserEntity<TEntityRelations>> {
    return this.getUser({ id }, {
      entityRelations: config.entityRelations,
      errorMessage: config.errorMessageFn?.(id) ?? `User (\`${id}\`) not found`,
      errorStatus: config.errorStatus
    });
  }

  public getUsersWithPagination(
    dto: GetUsersInputDTO,
    paginationOptions: { page: number, limit: number },
  ): Promise<{
    items: Array<UserEntity>,
    itemCount: number;
    itemsPerPage: number;
    currentPage: number;
  }> {
    return this.usersService.findManyWithPagination(paginationOptions, {
      where: (table) => like(table.name, `%${dto.nameLike}%`)
    })
  }

  public async checkIfUserExists(
    where: Partial<{ id: UUIDv4, name: string }> = {},
  ): Promise<boolean> {
    return this.usersService.exists({
      where: (table) => and(
        // TODO: Maybe there is a better way to do that
        ...(where.id ? [eq(table.id, where.id)] : []),
        ...(where.name ? [eq(table.name, where.name)] : []),
      )
    });
  }

  public async createUser(
    dto: CreateUserInputDTO,
    tx?: Transaction,
  ): Promise<UserEntity> {
    return this.usersService.createOne(dto, tx);
  }

  public async updateUser(
    user: UserEntity,
    dto: UpdateUserInputDTO,
    tx?: Transaction,
  ): Promise<UserEntity> {
    return this.usersService.updateOne(user, dto, tx);
  }

  public async replenishUserBalance(
    user: UserEntity,
    amount: number,
    tx?: Transaction,
  ): Promise<UserEntity> {
    return this.updateUser(user, { balance: user.balance + amount }, tx);
  }

  public async spendUserBalance(
    user: UserEntity,
    amount: number,
    tx?: Transaction,
  ): Promise<UserEntity> {
    return this.updateUser(user, { balance: user.balance - amount }, tx);
  }
}
