import { Injectable } from '@nestjs/common';
import { Database, Transaction } from 'src/infra/postgres/other/types';
import { InjectDatabase } from 'src/infra/decorators/inject-database.decorator';
import { QuickSoldUserItemEntity, quickSoldUserItemsTable, UserItemEntity } from 'src/infra/postgres/tables';
import { UserItemsService } from './user-items.service';

@Injectable()
export class QuickSoldUserItemsService {
  public constructor(
    @InjectDatabase()
    private readonly db: Database,

    private readonly userItemsService: UserItemsService,
  ) {}

  public async createOne(
    userItem: UserItemEntity,
    tx?: Transaction,
  ): Promise<QuickSoldUserItemEntity> {
    const { user, pokemon } = userItem;

    await this.userItemsService.deleteOne(userItem, tx);

    return (tx ?? this.db)
      .insert(quickSoldUserItemsTable)
      .values(userItem)
      .returning()
      .then(([quickSoldUserItem]) => ({
        ...quickSoldUserItem!,
        user,
        pokemon,
      }))
  }
}
