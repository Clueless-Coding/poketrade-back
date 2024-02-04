import { UUIDv4 } from 'src/common/types';
import { UserEntity } from './user.entity';
import { UserItemEntity } from './user-item.entity';
import { AutoMap } from '@automapper/classes';

export const tradeStatusEnumValues = [
  'PENDING',
  'CANCELLED',
  'ACCEPTED',
  'REJECTED',
] as const;

export type TradeStatus = typeof tradeStatusEnumValues[number];

export class TradeEntity {
  @AutoMap()
  public readonly id: UUIDv4;
  @AutoMap()
  public readonly createdAt: Date;
  @AutoMap()
  public readonly updatedAt: Date;
  @AutoMap()
  public readonly status: TradeStatus;
  @AutoMap(() => UserEntity)
  public readonly sender: UserEntity;
  @AutoMap(() => UserEntity)
  public readonly receiver: UserEntity;
  @AutoMap()
  public readonly statusedAt: Date;
}

export class PendingTradeEntity extends TradeEntity {
  @AutoMap()
  public readonly status: 'PENDING';
}

export class CancelledTradeEntity extends TradeEntity {
  @AutoMap()
  public readonly status: 'CANCELLED';
}

export class AcceptedTradeEntity extends TradeEntity {
  @AutoMap()
  public readonly status: 'ACCEPTED';
}

export class RejectedTradeEntity extends TradeEntity {
  @AutoMap()
  public readonly status: 'REJECTED';
}

export type CreatePendingTradeEntityValues = Omit<PendingTradeEntity,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'status'
  | 'statusedAt'
> & {
  senderItems: Array<UserItemEntity>,
  receiverItems: Array<UserItemEntity>,
}
