import { Injectable } from '@nestjs/common';
import { PaginationOptionsInputDTO } from 'src/api/dtos/pagination.input.dto';
import { PaginatedArray, UUIDv4 } from 'src/common/types';
import { Database, Transaction } from 'src/infra/postgres/types';
import { QuickSoldItemEntity } from '../entities/quick-sold-item.entity';
import { UserEntity } from '../entities/user.entity';
import { UserItemEntity } from '../entities/user-item.entity';
import { IQuickSoldItemsRepository } from '../repositories/quick-sold-items.repository';
import { IUserItemsRepository } from '../repositories/user-items.repository';
import { IUsersRepository } from '../repositories/users.repository';
import { AppConflictException } from '../exceptions';
import { InjectDatabase } from 'src/infra/ioc/decorators/inject-database.decorator';

@Injectable()
export class UserItemsService {
  public constructor(
    private readonly userItemsRepository: IUserItemsRepository,
    private readonly quickSoldItemsRepository: IQuickSoldItemsRepository,
    private readonly usersRepository: IUsersRepository,

    @InjectDatabase()
    private readonly db: Database,
  ) {}

  public async getUserItemsWithPaginationByUser(
    user: UserEntity,
    paginationOptionsDTO: PaginationOptionsInputDTO,
  ): Promise<PaginatedArray<UserItemEntity>> {
    return this.userItemsRepository.findUserItemsWithPagination({
      paginationOptions: paginationOptionsDTO,
      where: { userId: user.id },
    });
  }

  public async getUserItemsWithPaginationByUserId(
    userId: UUIDv4,
    paginationOptionsDTO: PaginationOptionsInputDTO,
  ): Promise<PaginatedArray<UserItemEntity>> {
    const user = await this.usersRepository.findUserById({ id: userId });

    return this.getUserItemsWithPaginationByUser(user, paginationOptionsDTO);
  }

  private async _quickSellUserItemByItemId(
    user: UserEntity,
    itemId: UUIDv4,
    tx: Transaction,
  ): Promise<QuickSoldItemEntity> {
    const userItem = await this.userItemsRepository.findUserItem({
      where: { itemId, userId: user.id },
    });

    const updatedUser = await this.usersRepository.replenishUserBalance(
      user,
      userItem.item.pokemon.worth,
      tx,
    );

    return this.quickSoldItemsRepository
      .createQuickSoldItem(userItem, tx)
      .then((quickSoldItem) => ({
        ...quickSoldItem,
        user: updatedUser,
      }));
  }

  public async quickSellUserItemByItemId(
    user: UserEntity,
    id: UUIDv4,
  ): Promise<QuickSoldItemEntity> {
    return this.db.transaction(async (tx) => (
      this._quickSellUserItemByItemId(user, id, tx)
    ));
  }
}
