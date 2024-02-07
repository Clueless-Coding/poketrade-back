import { Nullable } from 'src/common/types';
import { CreateItemEntityValues, ItemEntity } from '../entities/item.entity';
import { itemsTable, pokemonsTable, usersTable } from 'src/infra/postgres/tables';
import { UserItemEntity } from '../entities/user-item.entity';

export const mapItemsRowToEntity = (
  row: {
    items: typeof itemsTable['$inferSelect'];
    pokemons: typeof pokemonsTable['$inferSelect'];
    users: Nullable<typeof usersTable['$inferSelect']>,
  },
): ItemEntity => ({
  ...row.items,
  pokemon: row.pokemons,
  ...(row.users && { owner: row.users })
})

export abstract class IItemsRepository {
  public abstract convertItemToUserItem(
    item: ItemEntity,
  ): Promise<UserItemEntity>;

  public abstract convertItemsToUserItems(
    items: Array<ItemEntity>,
  ): Promise<Array<UserItemEntity>>;

  public abstract createItem(
    values: CreateItemEntityValues,
    tx?: unknown,
  ): Promise<ItemEntity>;
}
