import { AutoMap } from "@automapper/classes";
import { ChildEntity, Column } from "typeorm";
import { CreateEntityFields, CreateModel, FindEntityRelationsOptions } from "../other/types";
import { CreatePendingTradeEntityFields } from "./pending-trade.entity";
import { TradeEntity, TradeStatus } from "./trade.entity";

@ChildEntity(TradeStatus.ACCEPTED)
export class AcceptedTradeEntity extends TradeEntity {
  @AutoMap()
  public status: TradeStatus.ACCEPTED = TradeStatus.ACCEPTED;

  @AutoMap()
  @Column({ type: 'timestamptz' })
  public acceptedAt: Date;
}

export type CreateAcceptedTradeEntityFields =
  & CreatePendingTradeEntityFields
  & CreateEntityFields<
    AcceptedTradeEntity,
    'id'
  >;

export type AcceptedTradeModel<
  T extends FindEntityRelationsOptions<AcceptedTradeEntity> = {},
> = CreateModel<AcceptedTradeEntity, T>;
