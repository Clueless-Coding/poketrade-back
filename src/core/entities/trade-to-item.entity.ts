import { TradeEntity } from './trade.entity';
import { AutoMap } from '@automapper/classes';
import { ItemEntity } from './item.entity';
import { TradeToItemUserType } from '../enums/trade-to-item-user-type.enum';

class _TradeToItemEntity {
  @AutoMap(() => TradeEntity)
  public readonly trade: TradeEntity;
  @AutoMap()
  public readonly userType: TradeToItemUserType;
}

export class TradeToItemEntity extends _TradeToItemEntity {
  @AutoMap(() => ItemEntity)
  public readonly item: ItemEntity;
}

export class TradeToSenderItemEntity extends _TradeToItemEntity {
  @AutoMap()
  public readonly userType: TradeToItemUserType.SENDER;
  @AutoMap(() => ItemEntity)
  public readonly senderItem: ItemEntity;
}

export class TradeToReceiverItemEntity extends _TradeToItemEntity {
  @AutoMap()
  public readonly userType: TradeToItemUserType.RECEIVER;
  @AutoMap(() => ItemEntity)
  public readonly receiverItem: ItemEntity;
}

export type CreateTradeToItemEntityValues = TradeToItemEntity;
export type CreateTradeToSenderItemEntityValues = Omit<CreateTradeToItemEntityValues, 'userType' | 'item'> & {
  senderItem: ItemEntity,
};
export type CreateTradeToReceiverItemEntityValues = Omit<CreateTradeToItemEntityValues, 'userType' | 'item'> & {
  receiverItem: ItemEntity,
};
