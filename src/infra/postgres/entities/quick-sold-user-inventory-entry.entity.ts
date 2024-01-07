import { AutoMap } from '@automapper/classes';
import { CreateDateColumn, Entity } from 'typeorm';
import { CreateEntityFields, CreateModel, FindEntityRelationsOptions } from '../other/types';
import { CreateUserInventoryEntryEntityFields, UserInventoryEntryEntity } from './user-inventory-entry.entity';

@Entity('quick_sold_user_inventory_entries')
export class QuickSoldUserInventoryEntryEntity extends UserInventoryEntryEntity {
  @AutoMap()
  @CreateDateColumn({ type: 'timestamptz' })
  public readonly soldAt: Date;
}

export type CreateQuickSoldUserInventoryEntryEntityFields = CreateUserInventoryEntryEntityFields & CreateEntityFields<
  QuickSoldUserInventoryEntryEntity,
  'id'
>;

export type UpdateQuickSoldUserInventoryEntryEntityFields = never;

export type QuickSoldUserInventoryEntryModel<
  T extends FindEntityRelationsOptions<QuickSoldUserInventoryEntryEntity> = {},
> = CreateModel<QuickSoldUserInventoryEntryEntity, T>;
