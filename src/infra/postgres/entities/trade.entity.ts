import { AutoMap } from '@automapper/classes';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { BaseWithDateEntity } from '../other/base-with-date.entity';
import { CreateEntityFields, CreateModel, FindEntityRelationsOptions, UpdateEntityFields } from '../other/types';
import { UserInventoryEntryEntity } from './user-inventory-entry.entity';
import { UserEntity } from './user.entity';

export enum TradeStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DENIED = 'DENIED',
}

// TODO: Maybe in the future it will be more suitable to use TableInheritance feature of typeorm
@Entity('trades')
export class TradeEntity extends BaseWithDateEntity {
  @AutoMap()
  @Column({ type: 'enum', enum: TradeStatus })
  public status: TradeStatus;

  @AutoMap(() => UserEntity)
  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  public sender: UserEntity;

  @AutoMap(() => [UserInventoryEntryEntity])
  @ManyToMany(() => UserInventoryEntryEntity)
  @JoinTable({
    name: 'trade_sender_inventory_entries',
    joinColumn: { name: 'trade_id' },
    inverseJoinColumn: { name: 'user_inventory_entry_id' }
  })
  public senderInventoryEntries: Array<UserInventoryEntryEntity>;

  @AutoMap(() => UserEntity)
  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  public receiver: UserEntity;

  @AutoMap(() => [UserInventoryEntryEntity])
  @ManyToMany(() => UserInventoryEntryEntity)
  @JoinTable({
    name: 'trade_receiver_inventory_entries',
    joinColumn: { name: 'trade_id' },
    inverseJoinColumn: { name: 'user_inventory_entry_id' }
  })
  public receiverInventoryEntries: Array<UserInventoryEntryEntity>;
}

export type CreateTradeEntityFields = CreateEntityFields<
  TradeEntity,
  'status' | 'sender' | 'senderInventoryEntries' | 'receiver' | 'receiverInventoryEntries'
>;

export type UpdateTradeEntityFields = UpdateEntityFields<
  TradeEntity,
  'status'
>

export type TradeModel<
  T extends FindEntityRelationsOptions<TradeEntity> = {},
> = CreateModel<TradeEntity, T>;
