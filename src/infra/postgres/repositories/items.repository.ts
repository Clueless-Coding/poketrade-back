import { Injectable } from "@nestjs/common";
import { UUIDv4 } from "src/common/types";
import { CreateItemEntityValues, ItemEntity } from "src/core/entities/item.entity";
import { UserItemEntity } from "src/core/entities/user-item.entity";
import { AppConflictException } from "src/core/exceptions";
import { IItemsRepository } from "src/core/repositories/items.repository";
import { IUserItemsRepository } from "src/core/repositories/user-items.repository";
import { Database, Transaction } from "../types";
import { InjectDatabase } from "src/infra/ioc/decorators/inject-database.decorator";
import { itemsTable } from "../tables";

@Injectable()
export class ItemsRepository implements IItemsRepository {
  public constructor(
    @InjectDatabase()
    private readonly db: Database,
    private readonly userItemsRepository: IUserItemsRepository,
  ) {}

  public async convertItemToUserItem(
    item: ItemEntity,
  ): Promise<UserItemEntity> {
    if (!item.owner) throw new AppConflictException(`Item (\`${item.id}\`) has no owner`);

    return this.userItemsRepository.findUserItemByItemId({ id: item.id });
  }

  public async convertItemsToUserItems(
    items: Array<ItemEntity>,
  ): Promise<Array<UserItemEntity>> {
    const itemIds: Array<UUIDv4> = [];

    for (const item of items) {
      if (!item.owner) throw new AppConflictException(`Item (\`${item.id}\`) has no owner`);

      itemIds.push(item.id);
    }

    return this.userItemsRepository.findUserItemsByItemIds({ ids: itemIds });
  }

  public async createItem(
    values: CreateItemEntityValues,
    tx?: Transaction,
  ): Promise<ItemEntity> {
    const { pokemon } = values;

    return (tx ?? this.db)
      .insert(itemsTable)
      .values({
        ...values,
        pokemonId: pokemon.id,
      })
      .returning()
      .then(([item]) => ({
        ...item!,
        pokemon,
      }));
  }
}
