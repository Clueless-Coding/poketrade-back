import { Injectable } from '@nestjs/common';
import { and, eq, SQL } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { zip } from 'lodash';
import { Optional, UUIDv4 } from 'src/common/types';
import { InjectDatabase } from 'src/infra/decorators/inject-database.decorator';
import { Database, Transaction } from 'src/infra/postgres/other/types';
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
import { mapTradesRowToEntity } from './trades.service';
import { mapUserItemsRowToEntity } from './user-items.service';

type FindTradesToUserItemsWhere = Partial<{
  tradeId: UUIDv4,
  userType: TradeToUserItemUserType,
  userItemId: UUIDv4,
}>;
type FindTradesToUserItemsOptions = Partial<{
  where: FindTradesToUserItemsWhere,
}>;

type FindTradesToSenderItemsWhere = Omit<FindTradesToUserItemsWhere, 'userType'>;
type FindTradesToSenderItemsOptions = Partial<{
  where: FindTradesToSenderItemsWhere,
}>;
type FindTradesToReceiverItemsWhere = Omit<FindTradesToUserItemsWhere, 'userType'>;
type FindTradesToReceiverItemsOptions = Partial<{
  where: FindTradesToReceiverItemsWhere,
}>;

export const mapFindTradesToUserItemsWhereToSQL = (
  where: FindTradesToUserItemsWhere,
): Optional<SQL> => {
  return and(
    where.tradeId !== undefined ? eq(tradesToUserItemsTable.tradeId, where.tradeId) : undefined,
    where.userType !== undefined ? eq(tradesToUserItemsTable.userType, where.userType) : undefined,
    where.userItemId !== undefined ? eq(tradesToUserItemsTable.userItemId, where.userItemId) : undefined,
  );
};

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
) => {
  return {
    ...row.trades_to_user_items,
    trade: mapTradesRowToEntity(row),
    userItem: mapUserItemsRowToEntity(row),
  }
}

@Injectable()
export class TradesToUserItemsService {
  public constructor(
    @InjectDatabase()
    private readonly db: Database,
  ) {}

  private baseSelectBuilder(
    findTradesToUserItemsOptions: FindTradesToUserItemsOptions,
  ) {
    const { where = {} } = findTradesToUserItemsOptions;

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
      .where(mapFindTradesToUserItemsWhereToSQL(where));
  }

  public async findTradesToUserItems(
    findTradesToUserItemsOptions: FindTradesToUserItemsOptions,
  ): Promise<Array<TradeToUserItemEntity>> {
    return this
      .baseSelectBuilder(findTradesToUserItemsOptions)
      .then((rows) => rows.map((row) => mapTradesToUserItemsRowToEntity(row)));
  }

  public async findTradesToSenderItems(
    findTradesToSenderItemsOptions: FindTradesToSenderItemsOptions,
  ): Promise<Array<TradeToSenderItemEntity>> {
    const userType = 'SENDER';

    return this
      .findTradesToUserItems({
        ...findTradesToSenderItemsOptions,
        where: {
          ...findTradesToSenderItemsOptions.where,
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
    findTradesToReceiverItemsOptions: FindTradesToReceiverItemsOptions,
  ): Promise<Array<TradeToReceiverItemEntity>> {
    const userType = 'RECEIVER';

    return this
      .findTradesToUserItems({
        ...findTradesToReceiverItemsOptions,
        where: {
          ...findTradesToReceiverItemsOptions.where,
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
