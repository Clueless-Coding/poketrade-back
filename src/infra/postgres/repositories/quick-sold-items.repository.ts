import { Injectable } from '@nestjs/common';
import { Database, Transaction } from 'src/infra/postgres/types';
import { InjectDatabase } from 'src/infra/ioc/decorators/inject-database.decorator';
import { quickSoldItemsTable } from 'src/infra/postgres/tables';
import { QuickSoldItemEntity } from 'src/core/entities/quick-sold-item.entity';
import { UserItemEntity } from 'src/core/entities/user-item.entity';
import { IUserItemsRepository } from 'src/core/repositories/user-items.repository';
import { IQuickSoldItemsRepository } from 'src/core/repositories/quick-sold-items.repository';

@Injectable()
export class QuickSoldItemsRepository implements IQuickSoldItemsRepository {
  public constructor(
    @InjectDatabase()
    private readonly db: Database,

    private readonly userItemsRepository: IUserItemsRepository,
  ) {}

  public async createQuickSoldItem(
    userItem: UserItemEntity,
    tx?: Transaction,
  ): Promise<QuickSoldItemEntity> {
    const { user, item } = userItem;

    const [quickSoldItem] = await Promise.all([
      (tx ?? this.db)
        .insert(quickSoldItemsTable)
        .values({
          ...userItem,
          userId: userItem.user.id,
          itemId: userItem.item.id,
        })
      .returning()
        .then(([quickSoldItem]) => ({
          ...quickSoldItem!,
          user,
          item,
        })),
      this.userItemsRepository.deleteUserItem(userItem, tx),
    ]);

    return quickSoldItem;
  }
}
