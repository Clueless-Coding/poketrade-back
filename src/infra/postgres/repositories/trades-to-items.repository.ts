import { Injectable } from '@nestjs/common';
import { and, eq, SQL } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { zip } from 'lodash';
import { Nullable, Optional, PaginatedArray } from 'src/common/types';
import { FindEntitiesOptions, FindEntitiesWithPaginationOptions } from 'src/core/types';
import { InjectDatabase } from 'src/infra/ioc/decorators/inject-database.decorator';
import { Database, Transaction } from 'src/infra/postgres/types';
import {
  pokemonsTable,
  tradesTable,
  tradesToItemsTable,
  userItemsTable,
  usersTable,
} from 'src/infra/postgres/tables';
import {
  TradeToReceiverItemEntity,
  TradeToSenderItemEntity,
  TradeToItemEntity,
  CreateTradeToReceiverItemEntityValues,
  CreateTradeToSenderItemEntityValues,
  CreateTradeToItemEntityValues,
  TradeToItemUserType,
} from 'src/core/entities/trade-to-item.entity';
import { mapTradesRowToEntity } from './trades.repository';
import { FindTradesToReceiverItemsWhere, FindTradesToSenderItemsWhere, FindTradesToItemsWhere, ITradesToItemsRepository } from 'src/core/repositories/trades-to-items.repository';
import { transformPaginationOptions } from 'src/common/helpers/transform-pagination-options.helper';
import { calculateOffsetFromPaginationOptions } from 'src/common/helpers/calculate-offset-from-pagination-options.helper';
import { getTotalPaginationMeta } from 'src/common/helpers/get-total-pagination-meta.helper';
import { mapArrayToPaginatedArray } from 'src/common/helpers/map-array-to-paginated-array.helper';
import { itemsTable } from '../tables/items.table';
import { mapItemsRowToEntity } from 'src/core/repositories/items.repository';

export const mapTradesToItemsRowToEntity = (
  row: {
    trades_to_items: typeof tradesToItemsTable['$inferSelect'],
    trades: typeof tradesTable['$inferSelect'],
    senders: typeof usersTable['$inferSelect'],
    receivers: typeof usersTable['$inferSelect'],
    items: typeof itemsTable['$inferSelect'],
    pokemons: typeof pokemonsTable['$inferSelect'],
    users: Nullable<typeof usersTable['$inferSelect']>,
  }
): TradeToItemEntity => {
  return {
    ...row.trades_to_items,
    trade: mapTradesRowToEntity(row),
    item: mapItemsRowToEntity(row),
  }
}


@Injectable()
export class TradesToItemsRepository implements ITradesToItemsRepository {
  public constructor(
    @InjectDatabase()
    private readonly db: Database,
  ) {}

  private mapWhereToSQL(
    where: FindTradesToItemsWhere,
  ): Optional<SQL> {
    return and(
      where.tradeId !== undefined ? eq(tradesToItemsTable.tradeId, where.tradeId) : undefined,
      where.userType !== undefined ? eq(tradesToItemsTable.userType, where.userType) : undefined,
      where.itemId !== undefined ? eq(tradesToItemsTable.itemId, where.itemId) : undefined,
    );
  };

  private baseSelectBuilder(
    options: FindEntitiesOptions<FindTradesToItemsWhere>,
  ) {
    const { where = {} } = options;

    const sendersTable = alias(usersTable, 'senders');
    const receiversTable = alias(usersTable, 'receivers');

    return this.db
      .select()
      .from(tradesToItemsTable)
      .innerJoin(tradesTable, eq(tradesTable.id, tradesToItemsTable.tradeId))
      .innerJoin(sendersTable, eq(sendersTable.id, tradesTable.senderId))
      .innerJoin(receiversTable, eq(receiversTable.id, tradesTable.receiverId))
      .innerJoin(itemsTable, eq(itemsTable.id, tradesToItemsTable.itemId))
      .innerJoin(pokemonsTable, eq(pokemonsTable.id, itemsTable.pokemonId))
      .leftJoin(userItemsTable, eq(userItemsTable.itemId, itemsTable.id))
      .leftJoin(usersTable, eq(usersTable.id, userItemsTable.userId))
      .where(this.mapWhereToSQL(where));
  }

  public async findTradesToItems(
    options: FindEntitiesOptions<FindTradesToItemsWhere>,
  ): Promise<Array<TradeToItemEntity>> {
    return this
      .baseSelectBuilder(options)
      .then((rows) => rows.map((row) => mapTradesToItemsRowToEntity(row)));
  }

  public async findTradesToSenderItems(
    options: FindEntitiesOptions<FindTradesToSenderItemsWhere>,
  ): Promise<Array<TradeToSenderItemEntity>> {
    const userType = 'SENDER' satisfies TradeToItemUserType;

    return this
      .findTradesToItems({
        ...options,
        where: {
          ...options.where,
          userType,
        }
      })
      .then((tradesToItems) => tradesToItems.map((tradeToItem) => ({
        ...tradeToItem,
        userType,
        senderItem: tradeToItem.item,
      })));
  }

  public async findTradesToReceiverItems(
    options: FindEntitiesOptions<FindTradesToReceiverItemsWhere>,
  ): Promise<Array<TradeToReceiverItemEntity>> {
    const userType = 'RECEIVER' satisfies TradeToItemUserType;

    return this
      .findTradesToItems({
        ...options,
        where: {
          ...options.where,
          userType,
        }
      })
      .then((tradesToItems) => tradesToItems.map((tradeToItem) => ({
        ...tradeToItem,
        userType,
        receiverItem: tradeToItem.item,
      })));
  }

  public async findTradesToItemsWithPagination(
    options: FindEntitiesWithPaginationOptions<FindTradesToItemsWhere>,
  ): Promise<PaginatedArray<TradeToItemEntity>> {
    const {
      paginationOptions,
      where = {},
    } = options;

    const transformedPaginationOptions = transformPaginationOptions(paginationOptions);

    const { page, limit } = transformedPaginationOptions;
    const offset = calculateOffsetFromPaginationOptions(transformedPaginationOptions);

    const { totalItems, totalPages } = await getTotalPaginationMeta({
      db: this.db,
      table: tradesToItemsTable,
      whereSQL: this.mapWhereToSQL(where),
      limit,
    });

    return this
      .baseSelectBuilder(options)
      .offset(offset)
      .limit(limit)
      .then((rows) => mapArrayToPaginatedArray(
        rows.map((row) => mapTradesToItemsRowToEntity(row)),
        { page, limit, totalItems, totalPages },
      ));
  }

  public async findTradesToSenderItemsWithPagination(
    options: FindEntitiesWithPaginationOptions<FindTradesToSenderItemsWhere>,
  ): Promise<PaginatedArray<TradeToSenderItemEntity>> {
    const userType = 'SENDER' satisfies TradeToItemUserType;

    return this.findTradesToItemsWithPagination({
      ...options,
      where: {
        ...options.where,
        userType
      },
    }).then((paginatedArray) => ({
      ...paginatedArray,
      items: paginatedArray.items.map((tradeToItem) => ({
        ...tradeToItem,
        userType,
        senderItem: tradeToItem.item,
      }))
    }));
  }

  public async findTradesToReceiverItemsWithPagination(
    options: FindEntitiesWithPaginationOptions<FindTradesToReceiverItemsWhere>,
  ): Promise<PaginatedArray<TradeToReceiverItemEntity>> {
    const userType = 'RECEIVER' satisfies TradeToItemUserType;

    return this.findTradesToItemsWithPagination({
      ...options,
      where: {
        ...options.where,
        userType,
      },
    }).then((paginatedArray) => ({
      ...paginatedArray,
      items: paginatedArray.items.map((tradeToItem) => ({
        ...tradeToItem,
        userType,
        receiverItem: tradeToItem.item,
      }))
    }));
  }

  private async createTradesToItems(
    valuesArray: Array<CreateTradeToItemEntityValues>,
    tx?: Transaction,
  ): Promise<Array<TradeToItemEntity>> {
    if (!valuesArray.length) return [];

    return (tx ?? this.db)
      .insert(tradesToItemsTable)
      .values(valuesArray.map((values) => ({
        ...values,
        tradeId: values.trade.id,
        itemId: values.item.id,
      })))
      .returning()
      .then((tradesToItems) => zip(valuesArray, tradesToItems).map(([values, tradeToItem]) => ({
        ...tradeToItem!,
        trade: values!.trade,
        item: values!.item,
      })));
  }

  public async createTradesToSenderItems(
    valuesArray: Array<CreateTradeToSenderItemEntityValues>,
    tx?: Transaction,
  ): Promise<Array<TradeToSenderItemEntity>> {
    const userType = 'SENDER' satisfies TradeToItemUserType;

    return this
      .createTradesToItems(
        valuesArray.map((values) => ({
          ...values,
          userType,
          item: values.senderItem,
        })),
        tx,
      )
      .then((tradesToItems) => tradesToItems.map((tradesToItem) => ({
        ...tradesToItem,
        userType,
        senderItem: tradesToItem.item,
      })));
  }

  public async createTradesToReceiverItems(
    valuesArray: Array<CreateTradeToReceiverItemEntityValues>,
    tx?: Transaction,
  ): Promise<Array<TradeToReceiverItemEntity>> {
    const userType = 'RECEIVER' satisfies TradeToItemUserType;

    return this
      .createTradesToItems(
        valuesArray.map((values) => ({
          ...values,
          userType,
          item: values.receiverItem,
        })),
        tx,
      )
      .then((tradesToItems) => tradesToItems.map((tradesToItem) => ({
        ...tradesToItem,
        userType,
        receiverItem: tradesToItem.item,
      })));
  }
}
