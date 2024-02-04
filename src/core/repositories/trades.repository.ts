import {
  TradeEntity,
  TradeStatus,
  PendingTradeEntity,
  CreatePendingTradeEntityValues,
  CancelledTradeEntity,
  AcceptedTradeEntity,
  RejectedTradeEntity,
} from '../entities/trade.entity';
import { TradeToSenderItemEntity, TradeToReceiverItemEntity, } from '../entities/trade-to-user-item.entity'
import { UUIDv4 } from 'src/common/types';
import { FindEntityByIdOptions, FindEntityOptions } from '../types';

export type FindTradesWhere = Partial<{
  id: UUIDv4,
  ids: Array<UUIDv4>
  status: TradeStatus,
}>;

export type FindPendingTradesWhere = Omit<FindTradesWhere, 'status'>;

export abstract class ITradesRepository {
  public abstract findTrade(
    options: FindEntityOptions<FindTradesWhere>,
  ): Promise<TradeEntity>;

  public abstract findPendingTrade(
    options: FindEntityOptions<FindPendingTradesWhere>,
  ): Promise<PendingTradeEntity>;

  public abstract findPendingTradeById(
    options: FindEntityByIdOptions,
  ): Promise<PendingTradeEntity>;

  public abstract createPendingTrade(
    values: CreatePendingTradeEntityValues,
    tx?: unknown,
  ): Promise<{
    pendingTrade: PendingTradeEntity,
    tradesToSenderItems: Array<TradeToSenderItemEntity>,
    tradesToReceiverItems: Array<TradeToReceiverItemEntity>,
  }>;

  public abstract updatePendingTradeToCancelledTrade(
    pendingTrade: PendingTradeEntity,
    tx?: unknown,
  ): Promise<CancelledTradeEntity>;

  public abstract updatePendingTradeToAcceptedTrade(
    pendingTrade: PendingTradeEntity,
    tx?: unknown,
  ): Promise<AcceptedTradeEntity>;

  public abstract updatePendingTradeToRejectedTrade(
    pendingTrade: PendingTradeEntity,
    tx?: unknown,
  ): Promise<RejectedTradeEntity>;
}

