import { Injectable } from '@nestjs/common';
import { PaginationOptionsInputDTO } from 'src/api/dtos/pagination.input.dto';
import { PaginatedArray, UUIDv4 } from 'src/common/types';
import { Database, Transaction } from 'src/infra/postgres/types';
import { QuickSoldUserItemEntity } from '../entities/quick-sold-user-item.entity';
import { UserEntity } from '../entities/user.entity';
import { UserItemEntity } from '../entities/user-item.entity';
import { IQuickSoldUserItemsRepository } from '../repositories/quick-sold-user-items.repository';
import { IUserItemsRepository } from '../repositories/user-items.repository';
import { IUsersRepository } from '../repositories/users.repository';
import { AppConflictException } from '../exceptions';
import { InjectDatabase } from 'src/infra/ioc/decorators/inject-database.decorator';

@Injectable()
export class UserItemsService {
  public constructor(
    private readonly userItemsRepository: IUserItemsRepository,
    private readonly quickSoldUserItemsRepository: IQuickSoldUserItemsRepository,
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
