import {
  TradeEntity,
  PendingTradeEntity,
  CreatePendingTradeEntityValues,
  CancelledTradeEntity,
  AcceptedTradeEntity,
  RejectedTradeEntity,
} from '../entities/trade.entity';
import { TradeStatus } from '../enums/trade-status.enum';
import { TradeToSenderItemEntity, TradeToReceiverItemEntity, } from '../entities/trade-to-item.entity'
import { PaginatedArray, UUIDv4 } from 'src/common/types';
import { FindEntitiesWithPaginationOptions, FindEntityByIdOptions, FindEntityOptions } from '../types';

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

  public abstract findTradeById(
    options: FindEntityByIdOptions<UUIDv4>,
  ): Promise<TradeEntity>;

  public abstract findTradesWithPagination(
    options: FindEntitiesWithPaginationOptions<FindTradesWhere>,
  ): Promise<PaginatedArray<TradeEntity>>;

  public abstract findPendingTrade(
    options: FindEntityOptions<FindPendingTradesWhere>,
  ): Promise<PendingTradeEntity>;

  public abstract findPendingTradeById(
    options: FindEntityByIdOptions<UUIDv4>,
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

