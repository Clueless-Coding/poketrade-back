import { AutoMap } from "@automapper/classes";
import { ChildEntity } from "typeorm";
import { CreateEntityFields, CreateModel, FindEntityRelationsOptions } from "../other/types";
import { TradeEntity, TradeStatus } from "./trade.entity";

@ChildEntity(TradeStatus.PENDING)
export class PendingTradeEntity extends TradeEntity {
  @AutoMap()
  public status: TradeStatus.PENDING = TradeStatus.PENDING;
}

export type CreatePendingTradeEntityFields = CreateEntityFields<
  PendingTradeEntity,
  'sender' | 'senderInventoryEntries' | 'receiver' | 'receiverInventoryEntries'
>;

export type PendingTradeModel<
  T extends FindEntityRelationsOptions<PendingTradeEntity> = {},
> = CreateModel<PendingTradeEntity, T>;
