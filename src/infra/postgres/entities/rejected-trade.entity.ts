import { AutoMap } from '@automapper/classes';
import { ChildEntity, Column } from 'typeorm';
import { CreateEntityFields, CreateModel, FindEntityRelationsOptions } from '../other/types';
import { CreatePendingTradeEntityFields } from './pending-trade.entity';
import { TradeEntity, TradeStatus } from './trade.entity';

@ChildEntity(TradeStatus.REJECTED)
export class RejectedTradeEntity extends TradeEntity {
  @AutoMap()
  public status: TradeStatus.REJECTED = TradeStatus.REJECTED;

  @AutoMap()
  @Column({ type: 'timestamptz' })
  public rejectedAt: Date;
}

export type CreateRejectedTradeEntityFields =
  & CreatePendingTradeEntityFields
  & CreateEntityFields<
    RejectedTradeEntity,
    'id'
  >;

export type RejectedTradeModel<
  T extends FindEntityRelationsOptions<RejectedTradeEntity> = {},
> = CreateModel<RejectedTradeEntity, T>;
