import { AutoMap } from '@automapper/classes';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, TableInheritance } from 'typeorm';
import { BaseWithDateEntity } from '../other/base-with-date.entity';
import { FindEntityRelationsOptions } from '../other/types';
import { AcceptedTradeModel } from './accepted-trade.entity';
import { CancelledTradeModel } from './cancelled-trade.entity';
import { PendingTradeModel } from './pending-trade.entity';
import { RejectedTradeModel } from './rejected-trade.entity';
import { UserInventoryEntryEntity } from './user-inventory-entry.entity';
import { UserEntity } from './user.entity';

export enum TradeStatus {
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

@Entity('trades')
@TableInheritance({ column: { type: 'enum', enum: TradeStatus, name: 'status' } })
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

  public isPending(): this is PendingTradeModel {
    return this.status === TradeStatus.PENDING;
  }

  public isAccepted(): this is AcceptedTradeModel {
    return this.status === TradeStatus.ACCEPTED;
  }

  public isCancelled(): this is CancelledTradeModel {
    return this.status === TradeStatus.CANCELLED;
  }

  public isRejected(): this is RejectedTradeModel {
    return this.status === TradeStatus.REJECTED;
  }
}

export type TradeModel<
  T extends FindEntityRelationsOptions<TradeEntity> = {},
> = PendingTradeModel<T> | AcceptedTradeModel<T>;
