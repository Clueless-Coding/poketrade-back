import { Injectable } from '@nestjs/common';
import { Database, Transaction } from 'src/infra/postgres/other/types';
import { InjectDatabase } from 'src/infra/decorators/inject-database.decorator';
import { Nullable, Optional, PaginatedArray, PaginationOptions, UUIDv4 } from 'src/common/types';
import { CreateUserEntityValues, UpdateUserEntityValues, UserEntity, usersTable } from 'src/infra/postgres/tables';
import { and, eq, inArray, like, SQL } from 'drizzle-orm';
import { mapArrayToPaginatedArray } from 'src/common/helpers/map-array-to-paginated-array.helper';

type FindUsersWhere = Partial<{
  id: UUIDv4,
  ids: Array<UUIDv4>,
  name: string,
  nameLike: string,
}>;

type FindUsersOptions = Partial<{
  where: FindUsersWhere,
}>

type FindUsersWithPaginationOptions = FindUsersOptions & {
  paginationOptions: PaginationOptions,
}

export const mapFindUsersWhereToSQL = (
  where: FindUsersWhere,
): Optional<SQL> => {
  return and(
    where.id !== undefined ? eq(usersTable.id, where.id) : undefined,
    where.ids !== undefined ? inArray(usersTable.id, where.ids) : undefined,
    where.name !== undefined ? eq(usersTable.name, where.name) : undefined,
    where.nameLike !== undefined ? like(usersTable.name, `%${where.nameLike}%`) : undefined,
  );
}


@Injectable()
export class UsersService {
  public constructor(
    @InjectDatabase()
    private readonly db: Database,
  ) {}

  private baseSelectBuilder(
    findUsersOptions: FindUsersOptions,
  ) {
    const { where = {} } = findUsersOptions;

    return this.db
      .select()
      .from(usersTable)
      .where(mapFindUsersWhereToSQL(where));
  }

  public async findUsers(
    findUsersOptions: FindUsersOptions,
  ): Promise<Array<UserEntity>> {
    return this.baseSelectBuilder(findUsersOptions);
  }

  public async findUsersWithPagination(
    findUsersWithPaginationOptions: FindUsersWithPaginationOptions,
  ): Promise<PaginatedArray<UserEntity>> {
    const {
      paginationOptions: { page, limit },
    } = findUsersWithPaginationOptions;
    // TODO: check for boundaries
    const offset = (page - 1) * limit;

    // TODO: Pass these values to `mapArrayToPaginatedArray`
    // const totalItems = await this.db
    //   .select({
    //     totalItems: count(),
    //   })
    //   .from(usersTable)
    //   .where(this.mapWhereToSQL(where))
    //   .then(([row]) => row!.totalItems);
    // const totalPages = Math.ceil(totalItems / offset);

    return this
      .baseSelectBuilder(findUsersWithPaginationOptions)
      .offset(offset)
      .limit(limit)
      .then((users) => mapArrayToPaginatedArray(users, { page, limit }));
  }

  public async findUser(
    findUsersOptions: FindUsersOptions,
  ): Promise<Nullable<UserEntity>> {
    return this.baseSelectBuilder(findUsersOptions)
      .limit(1)
      .then(([user]) => user ?? null);
  }

  public async createUser(
    values: CreateUserEntityValues,
    tx?: Transaction,
  ): Promise<UserEntity> {
    return (tx ?? this.db)
      .insert(usersTable)
      .values(values)
      .returning()
      .then(([user]) => user!);
  }

  public async updateUser(
    user: UserEntity,
    values: UpdateUserEntityValues,
    tx?: Transaction,
  ): Promise<UserEntity> {
    return (tx ?? this.db)
      .update(usersTable)
      .set(values)
      .where(eq(usersTable.id, user.id))
      .returning()
      .then(([updatedUser]) => updatedUser!);
  }
}
