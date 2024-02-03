import { Injectable } from '@nestjs/common';
import { PaginationInputDTO } from 'src/api/dtos/pagination.input.dto';
import { PaginatedArray, UUIDv4 } from 'src/common/types';
import { Database, Transaction } from 'src/infra/postgres/types';
import { QuickSoldUserItemEntity, UserEntity, UserItemEntity } from 'src/infra/postgres/tables';
import { QuickSoldUserItemsRepository } from '../repositories/quick-sold-user-items.repository';
import { UserItemsRepository } from '../repositories/user-items.repository';
import { UsersRepository } from '../repositories/users.repository';
import { AppConflictException } from '../exceptions';
import { InjectDatabase } from 'src/infra/ioc/decorators/inject-database.decorator';

@Injectable()
export class UserItemsService {
  public constructor(
    private readonly userItemsRepository: UserItemsRepository,
    private readonly quickSoldUserItemsRepository: QuickSoldUserItemsRepository,
    private readonly usersRepository: UsersRepository,

    @InjectDatabase()
    private readonly db: Database,
  ) {}

  public async getUserItemsWithPaginationByUser(
    user: UserEntity,
    paginationDTO: PaginationInputDTO,
  ): Promise<PaginatedArray<UserItemEntity>> {
    return this.userItemsRepository.findUserItemsWithPagination({
      paginationOptions: paginationDTO,
      where: { userId: user.id },
    });
  }

  private async _quickSellUserItemById(
    user: UserEntity,
    id: UUIDv4,
    tx: Transaction,
  ): Promise<QuickSoldUserItemEntity> {
    const userItem = await this.userItemsRepository.findUserItemById({ id });

    if (user.id !== userItem.user.id) {
      throw new AppConflictException('You cannot quick sell someone else\'s pokemon');
    }

    const updatedUser = await this.usersRepository.replenishUserBalance(
      user,
      userItem.pokemon.worth,
      tx,
    );

    return this.quickSoldUserItemsRepository
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
