import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PaginationInputDTO } from 'src/api/dtos/pagination.input.dto';
import { GetUserItemsInputDTO } from 'src/api/dtos/user-items/get-user-items.input.dto';
import { PaginatedArray, UUIDv4 } from 'src/common/types';
import { Transaction } from 'src/infra/postgres/other/types';
import { PokemonEntity, QuickSoldUserItemEntity, UserEntity, UserItemEntity } from 'src/infra/postgres/tables';
import { QuickSoldUserItemsService } from '../services/quick-sold-user-items.service';
import { UserItemsService } from '../services/user-items.service';
import { UsersUseCase } from './users.use-case';

@Injectable()
export class UserItemsUseCase {
  public constructor(
    private readonly userItemsService: UserItemsService,
    private readonly quickSoldUserItemsService: QuickSoldUserItemsService,

    private readonly usersUseCase: UsersUseCase,
  ) {}

  public async getUserItem(
    where: Partial<{ id: UUIDv4, user: UserEntity }> = {},
    options: Partial<{
      errorMessage: string,
      errorStatus: HttpStatus,
    }> = {},
  ): Promise<UserItemEntity> {
    const {
      errorMessage = 'User item not found',
      errorStatus = HttpStatus.NOT_FOUND,
    } = options;

    const userItem = await this.userItemsService.findUserItem({
      where
    });

    if (!userItem) {
      throw new HttpException(errorMessage, errorStatus);
    }

    return userItem;
  }

  public async getUserItemById(
    id: UUIDv4,
    options: Partial<{
      errorMessageFn: (id: UUIDv4) => string,
      errorStatus: HttpStatus,
    }> = {},
  ): Promise<UserItemEntity> {
    const {
      errorMessageFn = (id) => `User item (\`${id}\`) not found`,
      errorStatus = HttpStatus.NOT_FOUND,
    } = options;

    return this.getUserItem({ id }, {
      errorMessage: errorMessageFn(id),
      errorStatus,
    });
  }

  public async getUserItemsWithPagination(
    dto: GetUserItemsInputDTO,
    paginationDTO: PaginationInputDTO,
  ): Promise<PaginatedArray<UserItemEntity>> {
    return this.userItemsService.findUserItemsWithPagination({
      paginationOptions: paginationDTO,
      where: dto,
    });
  }

  public async getUserItemsWithPaginationByUser(
    user: UserEntity,
    paginationDTO: PaginationInputDTO,
  ): Promise<PaginatedArray<UserItemEntity>> {
    return this.getUserItemsWithPagination({ userId: user.id }, paginationDTO);
  }

  public async getUserItemsByIds(
    ids: Array<UUIDv4>,
    options: Partial<{
      errorMessageFn: (id: UUIDv4) => string,
      errorStatus: HttpStatus,
    }>
  ): Promise<Array<UserItemEntity>> {
    if (!ids.length) return [];

    const {
      errorMessageFn = (id) => `User item (\`${id}\`) not found`,
      errorStatus = HttpStatus.NOT_FOUND,
    } = options;

    const userItems = await this.userItemsService.findUserItems({
      where: { ids }
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
  ): Promise<UserItemEntity> {
    return this.userItemsService.createUserItem({ user, pokemon }, tx);
  }

  public async transferUserItemsToAnotherUser(
    fromUserItems: Array<UserItemEntity>,
    toUser: UserEntity,
    tx?: Transaction,
  ): Promise<Array<UserItemEntity>> {
    if (!fromUserItems.length) return [];

    const set = new Set<UUIDv4>(fromUserItems.map(({ userId }) => userId));
    if (set.size > 1) {
      throw new HttpException('All of the items must have the same user', HttpStatus.CONFLICT);
    }

    const fromUserId = fromUserItems[0]!.userId;
    if (fromUserId === toUser.id) {
      throw new HttpException('You cannot transfer items to yourself', HttpStatus.CONFLICT);
    }

    return this.userItemsService.updateUserItems(fromUserItems, { user: toUser }, tx);
  }

  public async quickSellUserItem(
    user: UserEntity,
    userItem: UserItemEntity,
    tx?: Transaction,
  ): Promise<QuickSoldUserItemEntity> {
    if (user.id !== userItem.user.id) {
      throw new HttpException('You cannot quick sell someone else\'s pokemon', HttpStatus.CONFLICT);
    }

    const updatedUser = await this.usersUseCase.replenishUserBalance(
      user,
      userItem.pokemon.worth,
      tx,
    );

    return this.quickSoldUserItemsService
      .createQuickSoldUserItem(userItem, tx)
      .then((quickSoldUserItem) => ({
        ...quickSoldUserItem,
        user: updatedUser,
      }));
  }

  public async quickSellUserItemById(
    user: UserEntity,
    id: UUIDv4,
    tx?: Transaction,
  ): Promise<QuickSoldUserItemEntity> {
    const userItem = await this.getUserItemById(id);

    return this.quickSellUserItem(user, userItem, tx);
  }
}
