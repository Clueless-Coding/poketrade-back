import { Injectable } from '@nestjs/common';
import { and, eq, SQL } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { zip } from 'lodash';
import { Optional, UUIDv4 } from 'src/common/types';
import { FindEntitiesOptions } from 'src/core/types';
import { InjectDatabase } from 'src/infra/ioc/decorators/inject-database.decorator';
import { Database, Transaction } from 'src/infra/postgres/types';
import {
  CreateTradeToReceiverItemEntityValues,
  CreateTradeToSenderItemEntityValues,
  CreateTradeToUserItemEntityValues,
  pokemonsTable,
  tradesTable,
  tradesToUserItemsTable,
  TradeToReceiverItemEntity,
  TradeToSenderItemEntity,
  TradeToUserItemEntity,
  TradeToUserItemUserType,
  userItemsTable,
  usersTable,
} from 'src/infra/postgres/tables';
import { mapTradesRowToEntity } from './trades.repository';
import { mapUserItemsRowToEntity } from './user-items.repository';

type FindTradesToUserItemsWhere = Partial<{
  tradeId: UUIDv4,
  userType: TradeToUserItemUserType,
  userItemId: UUIDv4,
}>;

type FindTradesToSenderItemsWhere = Omit<FindTradesToUserItemsWhere, 'userType'>;
type FindTradesToReceiverItemsWhere = Omit<FindTradesToUserItemsWhere, 'userType'>;

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
export class TradesToUserItemsRepository {
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
    const userType = 'SENDER';

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
    const userType = 'RECEIVER';

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
    const userType = 'SENDER';

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
    const userType = 'RECEIVER';

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
