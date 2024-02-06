import { Injectable } from '@nestjs/common';
import { and, eq, SQL } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { zip } from 'lodash';
import { Optional, PaginatedArray } from 'src/common/types';
import { FindEntitiesOptions, FindEntitiesWithPaginationOptions } from 'src/core/types';
import { InjectDatabase } from 'src/infra/ioc/decorators/inject-database.decorator';
import { Database, Transaction } from 'src/infra/postgres/types';
import {
  pokemonsTable,
  tradesTable,
  tradesToUserItemsTable,
  userItemsTable,
  usersTable,
} from 'src/infra/postgres/tables';
import {
  TradeToReceiverItemEntity,
  TradeToSenderItemEntity,
  TradeToUserItemEntity,
  CreateTradeToReceiverItemEntityValues,
  CreateTradeToSenderItemEntityValues,
  CreateTradeToUserItemEntityValues,
  TradeToUserItemUserType,
} from 'src/core/entities/trade-to-user-item.entity';
import { mapTradesRowToEntity } from './trades.repository';
import { mapUserItemsRowToEntity } from './user-items.repository';
import { FindTradesToReceiverItemsWhere, FindTradesToSenderItemsWhere, FindTradesToUserItemsWhere, ITradesToUserItemsRepository } from 'src/core/repositories/trades-to-user-items.repository';
import { transformPaginationOptions } from 'src/common/helpers/transform-pagination-options.helper';
import { calculateOffsetFromPaginationOptions } from 'src/common/helpers/calculate-offset-from-pagination-options.helper';
import { getTotalPaginationMeta } from 'src/common/helpers/get-total-pagination-meta.helper';
import { mapArrayToPaginatedArray } from 'src/common/helpers/map-array-to-paginated-array.helper';

export const mapTradesToUserItemsRowToEntity = (
  row: Record<
    | 'trades_to_user_items'
    | 'trades'
    | 'senders'
    | 'receivers'
    | 'user_items'
    | 'users'
    | 'pokemons',
    any>,
): TradeToUserItemEntity => {
  return {
    ...row.trades_to_user_items,
    trade: mapTradesRowToEntity(row),
    userItem: mapUserItemsRowToEntity(row),
  }
}


@Injectable()
export class TradesToUserItemsRepository implements ITradesToUserItemsRepository {
  public constructor(
    @InjectDatabase()
    private readonly db: Database,
  ) {}

  private mapWhereToSQL(
    where: FindTradesToUserItemsWhere,
  ): Optional<SQL> {
    return and(
      where.tradeId !== undefined ? eq(tradesToUserItemsTable.tradeId, where.tradeId) : undefined,
      where.userType !== undefined ? eq(tradesToUserItemsTable.userType, where.userType) : undefined,
      where.userItemId !== undefined ? eq(tradesToUserItemsTable.userItemId, where.userItemId) : undefined,
    );
  };

  private baseSelectBuilder(
    options: FindEntitiesOptions<FindTradesToUserItemsWhere>,
  ) {
    const { where = {} } = options;

    const sendersTable = alias(usersTable, 'senders');
    const receiversTable = alias(usersTable, 'receivers');

    return this.db
      .select()
      .from(tradesToUserItemsTable)
      .innerJoin(tradesTable, eq(tradesTable.id, tradesToUserItemsTable.tradeId))
      .innerJoin(sendersTable, eq(sendersTable.id, tradesTable.senderId))
      .innerJoin(receiversTable, eq(receiversTable.id, tradesTable.receiverId))
      .innerJoin(userItemsTable, eq(userItemsTable.id, tradesToUserItemsTable.userItemId))
      .innerJoin(usersTable, eq(usersTable.id, userItemsTable.userId))
      .innerJoin(pokemonsTable, eq(pokemonsTable.id, userItemsTable.pokemonId))
      .where(this.mapWhereToSQL(where));
  }

  public async findTradesToUserItems(
    options: FindEntitiesOptions<FindTradesToUserItemsWhere>,
  ): Promise<Array<TradeToUserItemEntity>> {
    return this
      .baseSelectBuilder(options)
      .then((rows) => rows.map((row) => mapTradesToUserItemsRowToEntity(row)));
  }

  public async findTradesToSenderItems(
    options: FindEntitiesOptions<FindTradesToSenderItemsWhere>,
  ): Promise<Array<TradeToSenderItemEntity>> {
    const userType = 'SENDER' satisfies TradeToUserItemUserType;

    return this
      .findTradesToUserItems({
        ...options,
        where: {
          ...options.where,
          userType,
        }
      })
      .then((tradesToUserItems) => tradesToUserItems.map((tradeToUserItem) => ({
        ...tradeToUserItem,
        userType,
        senderItem: tradeToUserItem.userItem,
      })));
  }

  public async findTradesToReceiverItems(
    options: FindEntitiesOptions<FindTradesToReceiverItemsWhere>,
  ): Promise<Array<TradeToReceiverItemEntity>> {
    const userType = 'RECEIVER' satisfies TradeToUserItemUserType;

    return this
      .findTradesToUserItems({
        ...options,
        where: {
          ...options.where,
          userType,
        }
      })
      .then((tradesToUserItems) => tradesToUserItems.map((tradeToUserItem) => ({
        ...tradeToUserItem,
        userType,
        receiverItem: tradeToUserItem.userItem,
      })));
  }

  public async findTradesToUserItemsWithPagination(
    options: FindEntitiesWithPaginationOptions<FindTradesToUserItemsWhere>,
  ): Promise<PaginatedArray<TradeToUserItemEntity>> {
    const {
      paginationOptions,
      where = {},
    } = options;

    const transformedPaginationOptions = transformPaginationOptions(paginationOptions);

    const { page, limit } = transformedPaginationOptions;
    const offset = calculateOffsetFromPaginationOptions(transformedPaginationOptions);

    const { totalItems, totalPages } = await getTotalPaginationMeta({
      db: this.db,
      table: tradesToUserItemsTable,
      whereSQL: this.mapWhereToSQL(where),
      limit,
    });

    return this
      .baseSelectBuilder(options)
      .offset(offset)
      .limit(limit)
      .then((rows) => mapArrayToPaginatedArray(
        rows.map((row) => mapTradesToUserItemsRowToEntity(row)),
        { page, limit, totalItems, totalPages },
      ));
  }

  public async findTradesToSenderItemsWithPagination(
    options: FindEntitiesWithPaginationOptions<FindTradesToSenderItemsWhere>,
  ): Promise<PaginatedArray<TradeToSenderItemEntity>> {
    const userType = 'SENDER' satisfies TradeToUserItemUserType;

    return this.findTradesToUserItemsWithPagination({
      ...options,
      where: {
        ...options.where,
        userType
      },
    }).then((paginatedArray) => ({
      ...paginatedArray,
      items: paginatedArray.items.map((tradeToUserItem) => ({
        ...tradeToUserItem,
        userType,
        senderItem: tradeToUserItem.userItem,
      }))
    }));
  }

  public async findTradesToReceiverItemsWithPagination(
    options: FindEntitiesWithPaginationOptions<FindTradesToReceiverItemsWhere>,
  ): Promise<PaginatedArray<TradeToReceiverItemEntity>> {
    const userType = 'RECEIVER' satisfies TradeToUserItemUserType;

    return this.findTradesToUserItemsWithPagination({
      ...options,
      where: {
        ...options.where,
        userType,
      },
    }).then((paginatedArray) => ({
      ...paginatedArray,
      items: paginatedArray.items.map((tradeToUserItem) => ({
        ...tradeToUserItem,
        userType,
        receiverItem: tradeToUserItem.userItem,
      }))
    }));
  }

  private async createTradesToUserItems(
    valuesArray: Array<CreateTradeToUserItemEntityValues>,
    tx?: Transaction,
  ): Promise<Array<TradeToUserItemEntity>> {
    if (!valuesArray.length) return [];

    return (tx ?? this.db)
      .insert(tradesToUserItemsTable)
      .values(valuesArray.map((values) => ({
        ...values,
        tradeId: values.trade.id,
        userItemId: values.userItem.id,
      })))
      .returning()
      .then((tradesToUserItems) => zip(valuesArray, tradesToUserItems).map(([values, tradeToUserItem]) => ({
        ...tradeToUserItem!,
        trade: values!.trade,
        userItem: values!.userItem,
      })));
  }

  public async createTradesToSenderItems(
    valuesArray: Array<CreateTradeToSenderItemEntityValues>,
    tx?: Transaction,
  ): Promise<Array<TradeToSenderItemEntity>> {
    const userType = 'SENDER' satisfies TradeToUserItemUserType;

    return this
      .createTradesToUserItems(
        valuesArray.map((values) => ({
          ...values,
          userType,
          userItem: values.senderItem,
        })),
        tx,
      )
      .then((tradesToUserItems) => tradesToUserItems.map((tradesToUserItem) => ({
        ...tradesToUserItem,
        userType,
        senderItem: tradesToUserItem.userItem,
      })));
  }

  public async createTradesToReceiverItems(
    valuesArray: Array<CreateTradeToReceiverItemEntityValues>,
    tx?: Transaction,
  ): Promise<Array<TradeToReceiverItemEntity>> {
    const userType = 'RECEIVER' satisfies TradeToUserItemUserType;

    return this
      .createTradesToUserItems(
        valuesArray.map((values) => ({
          ...values,
          userType,
          userItem: values.receiverItem,
        })),
        tx,
      )
      .then((tradesToUserItems) => tradesToUserItems.map((tradesToUserItem) => ({
        ...tradesToUserItem,
        userType,
        receiverItem: tradesToUserItem.userItem,
      })));
  }
}
