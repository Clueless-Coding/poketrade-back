import { UserItemEntity } from './user-item.entity';
import { TradeEntity } from './trade.entity';
import { AutoMap } from '@automapper/classes';

export const userTypeEnumValues = ['SENDER', 'RECEIVER'] as const;
export type TradeToUserItemUserType = typeof userTypeEnumValues[number];

class _TradeToUserItemEntity {
  @AutoMap(() => TradeEntity)
  public readonly trade: TradeEntity;
  @AutoMap()
  public readonly userType: TradeToUserItemUserType;
}

export class TradeToUserItemEntity extends _TradeToUserItemEntity {
  @AutoMap(() => UserItemEntity)
  public readonly userItem: UserItemEntity;
}

export class TradeToSenderItemEntity extends _TradeToUserItemEntity {
  @AutoMap()
  public readonly userType: 'SENDER';
  @AutoMap(() => UserItemEntity)
  public readonly senderItem: UserItemEntity;
}

export class TradeToReceiverItemEntity extends _TradeToUserItemEntity {
  @AutoMap()
  public readonly userType: 'RECEIVER';
  @AutoMap(() => UserItemEntity)
  public readonly receiverItem: UserItemEntity;
}

export type CreateTradeToUserItemEntityValues = TradeToUserItemEntity;
export type CreateTradeToSenderItemEntityValues = Omit<CreateTradeToUserItemEntityValues, 'userType' | 'userItem'> & {
  senderItem: UserItemEntity,
};
export type CreateTradeToReceiverItemEntityValues = Omit<CreateTradeToUserItemEntityValues, 'userType' | 'userItem'> & {
  receiverItem: UserItemEntity,
};
