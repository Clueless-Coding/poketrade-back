import { UserItemEntity } from '../entities/user-item.entity';
import { QuickSoldItemEntity } from '../entities/quick-sold-item.entity';

export abstract class IQuickSoldItemsRepository {
  public abstract createQuickSoldItem(
    userItem: UserItemEntity,
    tx?: unknown,
  ): Promise<QuickSoldItemEntity>;
}
