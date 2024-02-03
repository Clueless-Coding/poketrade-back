import { Injectable } from '@nestjs/common';
import { PaginationInputDTO } from 'src/api/dtos/pagination.input.dto';
import { PaginatedArray, UUIDv4 } from 'src/common/types';
import { Database, Transaction } from 'src/infra/postgres/types';
import { QuickSoldUserItemEntity, UserEntity, UserItemEntity } from 'src/infra/postgres/tables';
import { QuickSoldUserItemsService } from '../services/quick-sold-user-items.service';
import { UserItemsService } from '../services/user-items.service';
import { UsersService } from '../services/users.service';
import { AppConflictException } from '../exceptions';
import { InjectDatabase } from 'src/infra/ioc/decorators/inject-database.decorator';

@Injectable()
export class UserItemsUseCase {
  public constructor(
    private readonly userItemsService: UserItemsService,
    private readonly quickSoldUserItemsService: QuickSoldUserItemsService,
    private readonly usersService: UsersService,

    @InjectDatabase()
    private readonly db: Database,
  ) {}

  public async getUserItemsWithPaginationByUser(
    user: UserEntity,
    paginationDTO: PaginationInputDTO,
  ): Promise<PaginatedArray<UserItemEntity>> {
    return this.userItemsService.findUserItemsWithPagination({
      paginationOptions: paginationDTO,
      where: { userId: user.id },
    });
  }

  private async _quickSellUserItemById(
    user: UserEntity,
    id: UUIDv4,
    tx: Transaction,
  ): Promise<QuickSoldUserItemEntity> {
    const userItem = await this.userItemsService.findUserItemById({ id });

    if (user.id !== userItem.user.id) {
      throw new AppConflictException('You cannot quick sell someone else\'s pokemon');
    }

    const updatedUser = await this.usersService.replenishUserBalance(
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
  ): Promise<QuickSoldUserItemEntity> {
    return this.db.transaction(async (tx) => (
      this._quickSellUserItemById(user, id, tx)
    ));
  }
}
