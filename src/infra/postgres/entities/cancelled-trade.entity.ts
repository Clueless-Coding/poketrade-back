import { AutoMap } from "@automapper/classes";
import { ChildEntity, Column } from "typeorm";
import { CreateEntityFields, CreateModel, FindEntityRelationsOptions } from "../other/types";
import { CreatePendingTradeEntityFields } from "./pending-trade.entity";
import { TradeEntity, TradeStatus } from "./trade.entity";

@ChildEntity(TradeStatus.CANCELLED)
export class CancelledTradeEntity extends TradeEntity {
  @AutoMap()
  public status: TradeStatus.CANCELLED = TradeStatus.CANCELLED;

  @AutoMap()
  @Column({ type: 'timestamptz' })
  public cancelledAt: Date;
}

export type CreateCancelledTradeEntityFields =
  & CreatePendingTradeEntityFields
  & CreateEntityFields<
    CancelledTradeEntity,
    'id'
  >;

export type CancelledTradeModel<
  T extends FindEntityRelationsOptions<CancelledTradeEntity> = {},
> = CreateModel<CancelledTradeEntity, T>;
