import { UserItemEntity } from '../entities/user-item.entity';
import { QuickSoldUserItemEntity } from '../entities/quick-sold-user-item.entity';

export abstract class IQuickSoldUserItemsRepository {
  public abstract createQuickSoldUserItem(
    userItem: UserItemEntity,
    tx?: unknown,
  ): Promise<QuickSoldUserItemEntity>;
}
