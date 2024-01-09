import { AutoMap } from "@automapper/classes";
import { ChildEntity } from "typeorm";
import { CreateEntityFields, CreateModel, FindEntityRelationsOptions, UpdateEntityFields } from "../other/types";
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

export type UpdatePendingTradeEntityFields = UpdateEntityFields<
  PendingTradeEntity,
  'status'
>

export type PendingTradeModel<
  T extends FindEntityRelationsOptions<PendingTradeEntity> = {},
> = CreateModel<PendingTradeEntity, T>;
