import { PaginatedArray, UUIDv4 } from 'src/common/types';
import { FindEntitiesOptions, FindEntitiesWithPaginationOptions } from '../types';
import {
  CreateTradeToReceiverItemEntityValues,
  CreateTradeToSenderItemEntityValues,
  TradeToReceiverItemEntity,
  TradeToSenderItemEntity,
  TradeToUserItemEntity,
  TradeToUserItemUserType,
} from '../entities/trade-to-user-item.entity';

export type FindTradesToUserItemsWhere = Partial<{
  tradeId: UUIDv4,
  userType: TradeToUserItemUserType,
  userItemId: UUIDv4,
}>;

export type FindTradesToSenderItemsWhere = Omit<FindTradesToUserItemsWhere, 'userType'>;
export type FindTradesToReceiverItemsWhere = Omit<FindTradesToUserItemsWhere, 'userType'>;

export abstract class ITradesToUserItemsRepository {
  public abstract findTradesToUserItems(
    options: FindEntitiesOptions<FindTradesToUserItemsWhere>,
  ): Promise<Array<TradeToUserItemEntity>>;

  public abstract findTradesToSenderItems(
    options: FindEntitiesOptions<FindTradesToSenderItemsWhere>,
  ): Promise<Array<TradeToSenderItemEntity>>;

  public abstract findTradesToReceiverItems(
    options: FindEntitiesOptions<FindTradesToReceiverItemsWhere>,
  ): Promise<Array<TradeToReceiverItemEntity>>;

  public abstract findTradesToUserItemsWithPagination(
    options: FindEntitiesWithPaginationOptions<FindTradesToUserItemsWhere>,
  ): Promise<PaginatedArray<TradeToUserItemEntity>>;

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
