import { Injectable } from '@nestjs/common';
import { Database, Transaction } from 'src/infra/postgres/types';
import { InjectDatabase } from 'src/infra/ioc/decorators/inject-database.decorator';
import { quickSoldUserItemsTable } from 'src/infra/postgres/tables';
import { QuickSoldUserItemEntity } from 'src/core/entities/quick-sold-user-item.entity';
import { UserItemEntity } from 'src/core/entities/user-item.entity';
import { IUserItemsRepository } from 'src/core/repositories/user-items.repository';
import { IQuickSoldUserItemsRepository } from 'src/core/repositories/quick-sold-user-items.repository';

@Injectable()
export class QuickSoldUserItemsRepository implements IQuickSoldUserItemsRepository {
  public constructor(
    @InjectDatabase()
    private readonly db: Database,

    private readonly userItemsRepository: IUserItemsRepository,
  ) {}

  public async createQuickSoldUserItem(
    userItem: UserItemEntity,
    tx?: Transaction,
  ): Promise<QuickSoldUserItemEntity> {
    const { user, pokemon } = userItem;

    const [quickSoldUserItem] = await Promise.all([
      (tx ?? this.db)
        .insert(quickSoldUserItemsTable)
        .values({
          ...userItem,
          userId: userItem.user.id,
          pokemonId: userItem.pokemon.id,
        })
      .returning()
        .then(([quickSoldUserItem]) => ({
          ...quickSoldUserItem!,
          user,
          pokemon,
        })),
      this.userItemsRepository.deleteUserItem(userItem, tx),
    ]);

    return quickSoldUserItem;
  }
}
