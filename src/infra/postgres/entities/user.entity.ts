import { Column, Entity, OneToMany } from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { OpenedPackEntity } from './opened-pack.entity';
import { CreateModel, CreateEntityFields, UpdateEntityFields, FindEntityRelationsOptions } from '../other/types';
import { BaseWithDateEntity } from '../other/base-with-date.entity';
import { UserInventoryEntryEntity } from './user-inventory-entry.entity';
import { QuickSoldUserInventoryEntryEntity } from './quick-sold-user-inventory-entry.entity';
import { PendingTradeEntity } from './pending-trade.entity';

@Entity('users')
export class UserEntity extends BaseWithDateEntity {
  @AutoMap()
  @Column({ type: 'text', unique: true })
  public readonly name: string;

  @Column({ type: 'text' })
  public readonly hashedPassword: string;

  // TODO: consider adding check constraint
  @AutoMap()
  @Column({ type: 'integer', default: 0 })
  public readonly balance: number;

  @AutoMap(() => [UserInventoryEntryEntity])
  @OneToMany(
    () => UserInventoryEntryEntity,
    (userInventoryEntry) => userInventoryEntry.user,
  )
  public readonly inventoryEntries: Array<UserInventoryEntryEntity>;

  @AutoMap(() => [OpenedPackEntity])
  @OneToMany(() => OpenedPackEntity, (openedPack) => openedPack.user)
  public readonly openedPacks: Array<OpenedPackEntity>;

  @AutoMap(() => [QuickSoldUserInventoryEntryEntity])
  @OneToMany(
    () => QuickSoldUserInventoryEntryEntity,
    (quickSoldUserInventoryEntry) => quickSoldUserInventoryEntry.user,
  )
  public readonly quickSoldInventoryEntries: Array<QuickSoldUserInventoryEntryEntity>;

  @AutoMap(() => [PendingTradeEntity])
  @OneToMany(
    () => PendingTradeEntity,
    (trade) => trade.sender,
  )
  public readonly pendingSendingTrades: Array<PendingTradeEntity>;

  @AutoMap(() => [PendingTradeEntity])
  @OneToMany(
    () => PendingTradeEntity,
    (trade) => trade.receiver,
  )
  public readonly pendingReceivingTrades: Array<PendingTradeEntity>;
}

export type CreateUserEntityFields = CreateEntityFields<
  UserEntity,
  'name' | 'hashedPassword'
>;

export type UpdateUserEntityFields = Partial<CreateUserEntityFields> & UpdateEntityFields<
  UserEntity,
  'balance'
>;

export type UserModel<
  T extends FindEntityRelationsOptions<UserEntity> = {},
> = CreateModel<UserEntity, T>;
