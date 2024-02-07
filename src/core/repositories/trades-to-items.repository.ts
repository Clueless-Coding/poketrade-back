import { PaginatedArray, UUIDv4 } from 'src/common/types';
import { FindEntitiesOptions, FindEntitiesWithPaginationOptions } from '../types';
import {
  CreateTradeToReceiverItemEntityValues,
  CreateTradeToSenderItemEntityValues,
  TradeToReceiverItemEntity,
  TradeToSenderItemEntity,
  TradeToItemEntity,
  TradeToItemUserType,
} from '../entities/trade-to-item.entity';

export type FindTradesToItemsWhere = Partial<{
  tradeId: UUIDv4,
  userType: TradeToItemUserType,
  itemId: UUIDv4,
}>;

export type FindTradesToSenderItemsWhere = Omit<FindTradesToItemsWhere, 'userType'>;
export type FindTradesToReceiverItemsWhere = Omit<FindTradesToItemsWhere, 'userType'>;

export abstract class ITradesToItemsRepository {
  public abstract findTradesToItems(
    options: FindEntitiesOptions<FindTradesToItemsWhere>,
  ): Promise<Array<TradeToItemEntity>>;

  public abstract findTradesToSenderItems(
    options: FindEntitiesOptions<FindTradesToSenderItemsWhere>,
  ): Promise<Array<TradeToSenderItemEntity>>;

  public abstract findTradesToReceiverItems(
    options: FindEntitiesOptions<FindTradesToReceiverItemsWhere>,
  ): Promise<Array<TradeToReceiverItemEntity>>;

  public abstract findTradesToItemsWithPagination(
    options: FindEntitiesWithPaginationOptions<FindTradesToItemsWhere>,
  ): Promise<PaginatedArray<TradeToItemEntity>>;

  public abstract findTradesToSenderItemsWithPagination(
    options: FindEntitiesWithPaginationOptions<FindTradesToSenderItemsWhere>,
  ): Promise<PaginatedArray<TradeToSenderItemEntity>>;

  public abstract findTradesToReceiverItemsWithPagination(
    options: FindEntitiesWithPaginationOptions<FindTradesToReceiverItemsWhere>,
  ): Promise<PaginatedArray<TradeToReceiverItemEntity>>;

  public abstract createTradesToSenderItems(
    valuesArray: Array<CreateTradeToSenderItemEntityValues>,
    tx?: unknown,
  ): Promise<Array<TradeToSenderItemEntity>>;

  public abstract createTradesToReceiverItems(
    valuesArray: Array<CreateTradeToReceiverItemEntityValues>,
    tx?: unknown,
  ): Promise<Array<TradeToReceiverItemEntity>>;
}
