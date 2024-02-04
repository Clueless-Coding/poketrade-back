import { QuickSoldUserItemEntity, UserItemEntity } from 'src/infra/postgres/tables';

export abstract class IQuickSoldUserItemsRepository {
  public abstract createQuickSoldUserItem(
    userItem: UserItemEntity,
    tx?: unknown,
  ): Promise<QuickSoldUserItemEntity>;
}
