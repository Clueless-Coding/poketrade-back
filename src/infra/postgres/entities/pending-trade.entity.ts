import { AutoMap } from "@automapper/classes";
import { ChildEntity } from "typeorm";
import { CreateEntityFields, CreateModel, FindEntityRelationsOptions, RemovePropertiesWithNever } from "../other/types";
import { TradeEntity, TradeStatus } from "./trade.entity";
import { UserInventoryEntryModel } from "./user-inventory-entry.entity";
import { UserModel } from "./user.entity";

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

export type PendingEntityFindRelationsOptionsFromCreateFields<
  T extends CreatePendingTradeEntityFields,
> = RemovePropertiesWithNever<{
  [K in keyof T]: T[K] extends UserModel<infer X>
    ? X extends Record<string, never>
      ? true
      : X
    : T[K] extends Array<UserInventoryEntryModel<infer Y>>
      ? Y extends Record<string, never>
        ? true
        : Y
      : never
}>
