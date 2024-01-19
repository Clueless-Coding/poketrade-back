import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { and, eq, ExtractTablesWithRelations, inArray } from 'drizzle-orm';
import { UUIDv4 } from 'src/common/types';
import { UserItemEntity, UserEntity, PokemonEntity, Transaction, EntityRelations } from 'src/infra/postgres/other/types';
import { UserItemsService } from '../services/user-items.service';
import { QuickSoldUserItemsUseCase } from './quick-sold-user-items.use-case';
import { UsersUseCase } from './users.use-case';
import * as tables from 'src/infra/postgres/tables';


@Injectable()
export class UserItemsUseCase {
  public constructor(
    private readonly userItemsService: UserItemsService,

    private readonly usersUseCase: UsersUseCase,
    private readonly quickSoldUserItemsUseCase: QuickSoldUserItemsUseCase,
  ) {}

  public async getUserItem(
    where: Partial<{ id: UUIDv4 }> = {},
    errorMessage: string = 'User item not found',
    errorStatus: HttpStatus = HttpStatus.NOT_FOUND,
  ): Promise<UserItemEntity<{ user: true, pokemon: true }>> {
    const userItem = await this.userItemsService.findOne({
      where: (table) => and(
        // TODO: Maybe there is a better way to do that
        ...(where.id ? [eq(table.id, where.id)] : []),
      ),
      with: {
        user: true,
        pokemon: true,
      }
    });

    if (!userItem) {
      throw new HttpException(errorMessage, errorStatus);
    }

    return userItem;
  }

  public async getUserItemById(
    id: UUIDv4,
    errorMessageFn: (id: UUIDv4) => string = (id) => `User item (\`${id}\`) not found`,
    errorStatus: HttpStatus = HttpStatus.NOT_FOUND,
  ): Promise<UserItemEntity<{ user: true, pokemon: true }>> {
    return this.getUserItem({ id }, errorMessageFn(id), errorStatus)
  }

  // public async findManyUserItems(
  //   where: Partial<{ id: UUIDv4 }> = {},
  // ): Promise<Array<UserItemEntity<{ user: true, pokemon: true }>>> {
  //   return this.userItemsService.findMany({
  //     where: (table) => and(
  //       ...(where.id ? [eq(table.id, where.id)] : []),
  //     ),
  //     with: {
  //       user: true,
  //       pokemon: true,
  //     }
  //   });
  // }

  public async getUserItemsByIds(
    ids: Array<UUIDv4>,
    errorMessageFn: (id: UUIDv4) => string = (id) => `User item (\`${id}\`) not found`,
    errorStatus: HttpStatus = HttpStatus.NOT_FOUND,
  ): Promise<Array<UserItemEntity<{ user: true, pokemon: true }>>> {
    const userItems = await this.userItemsService.findMany({
      where: (table) => inArray(table.id, ids),
      with: {
        user: true,
        pokemon: true,
      }
    });

    for (const id of ids) {
      const userItem = userItems.some((userItem) => userItem.id === id);

      if (!userItem) {
        throw new HttpException(errorMessageFn(id), errorStatus);
      }
    }

    return userItems;
  }

  public async createUserItem(
    user: UserEntity,
    pokemon: PokemonEntity,
    tx?: Transaction,
  ): Promise<UserItemEntity<{ user: true, pokemon: true }>> {
    return this.userItemsService
      .createOne({
        userId: user.id,
        pokemonId: pokemon.id,
      }, tx)
      .then((userItem) => ({
        ...userItem,
        user,
        pokemon,
      }));
  }

  public async transferUserItemsToAnotherUser(
    fromUserItems: Array<UserItemEntity>,
    toUser: UserEntity,
    tx?: Transaction,
  ) {
    if (!fromUserItems.length) return [];

    const set = new Set<UUIDv4>(fromUserItems.map(({ id }) => id));
    if (set.size > 1) {
      throw new HttpException('All of the items must have the same user', HttpStatus.CONFLICT);
    }

    const fromUserId = fromUserItems[0]!.id;
    if (fromUserId === toUser.id) {
      throw new HttpException('You cannot transfer items to yourself', HttpStatus.CONFLICT);
    }

    return this.userItemsService.updateMany(fromUserItems, { userId: toUser.id }, tx);
  }

  public async deleteUserItem<
    TEntityRelations extends EntityRelations<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>['userItems']> = {},
  >(
    userItem: UserItemEntity<TEntityRelations>,
    tx?: Transaction,
  ): Promise<UserItemEntity<TEntityRelations>> {
    return this.userItemsService.deleteOne(userItem, tx);
  }

  public async deleteUserItemById(
    id: UUIDv4,
    tx?: Transaction,
  ): Promise<UserItemEntity> {
    const userItem = await this.getUserItemById(id);

    return this.deleteUserItem(userItem, tx);
  }

  public async quickSellUserItem(
    user: UserEntity,
    userItem: UserItemEntity<{ user: true, pokemon: true }>,
  ) {
    if (user.id !== userItem.user!.id) {
      throw new HttpException('You cannot quick sell someone else\'s pokemon', HttpStatus.CONFLICT);
    }

    const [updatedUser, deletedUserItem] = await Promise.all([
      this.usersUseCase.replenishUserBalance(user, userItem.pokemon!.worth),
      this.deleteUserItem(userItem),
    ]);

    return this.quickSoldUserItemsUseCase.createQuickSoldUserItem(
      userItem,
      updatedUser,
      deletedUserItem.pokemon!,
    )
  }
}
