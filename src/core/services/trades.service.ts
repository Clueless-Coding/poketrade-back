import { Injectable } from '@nestjs/common';
import { Database, Transaction } from 'src/infra/postgres/other/types';
import {
  tradesTable,
  usersTable,
  TradeEntity,
  TradeStatus,
  PendingTradeEntity,
  CreatePendingTradeEntityValues,
  TradeToSenderItemEntity,
  TradeToReceiverItemEntity,
  CancelledTradeEntity,
  AcceptedTradeEntity,
  RejectedTradeEntity,
} from 'src/infra/postgres/tables';
import { InjectDatabase } from 'src/infra/decorators/inject-database.decorator';
import { and, eq, inArray, sql, SQL } from 'drizzle-orm';
import { Nullable, Optional, UUIDv4 } from 'src/common/types';
import { alias } from 'drizzle-orm/pg-core';
import { TradesToUserItemsService } from './trades-to-user-items.service';

type FindTradesWhere = Partial<{
  id: UUIDv4,
  ids: Array<UUIDv4>
  status: TradeStatus,
}>

type FindTradesOptions = Partial<{
  where: FindTradesWhere,
}>

type FindPendingTradesOptions = Omit<FindTradesOptions, 'where'> & Partial<{
  where: Omit<FindTradesWhere, 'status'>,
}>;

export const mapFindTradesWhereToSQL = (
  where: FindTradesWhere,
): Optional<SQL> => {
  return and(
    where.id !== undefined ? eq(tradesTable.id, where.id) : undefined,
    where.ids !== undefined ? inArray(tradesTable.id, where.ids) : undefined,
    where.status !== undefined ? eq(tradesTable.status, where.status) : undefined,
  );
}

export const mapTradesRowToEntity = (
  row: Record<'trades' | 'senders' | 'receivers', any>,
) => {
  return {
    ...row.trades,
    sender: row.senders,
    receiver: row.receivers,
  }
};

@Injectable()
export class TradesService {
  public constructor(
    @InjectDatabase()
    private readonly db: Database,

    private readonly tradesToUserItemsService: TradesToUserItemsService,
  ) {}

  private baseSelectBuilder(
    findTradesOptions: FindTradesOptions,
  ) {
    const { where = {} } = findTradesOptions;

    const sendersTable = alias(usersTable, 'senders');
    const receiversTable = alias(usersTable, 'receivers');

    return this.db
      .select()
      .from(tradesTable)
      .innerJoin(sendersTable, eq(sendersTable.id, tradesTable.senderId))
      .innerJoin(receiversTable, eq(receiversTable.id, tradesTable.receiverId))
      .where(mapFindTradesWhereToSQL(where));
  }

  public async findTrade(
    findTradesOptions: FindTradesOptions,
  ): Promise<Nullable<TradeEntity>> {
    return this
      .baseSelectBuilder(findTradesOptions)
      .limit(1)
      .then(([row]) => (
        row
        ? mapTradesRowToEntity(row)
        : null
      ));
  }

  public async findPendingTrade(
    findPendingTradesOptions: FindPendingTradesOptions,
  ): Promise<Nullable<PendingTradeEntity>> {
    const status = 'PENDING';

    return this
      .findTrade({
        ...findPendingTradesOptions,
        where: {
          ...findPendingTradesOptions.where,
          status
        }
      })
      .then((trade) => (
        trade ? {
          ...trade,
          status: status as typeof status,
        } : null
      ))
  }

  public async createPendingTrade(
    values: CreatePendingTradeEntityValues,
    tx?: Transaction,
  ): Promise<{
    pendingTrade: PendingTradeEntity,
    tradesToSenderItems: Array<TradeToSenderItemEntity>,
    tradesToReceiverItems: Array<TradeToReceiverItemEntity>,
  }> {
    const status = 'PENDING';
    const { sender, senderItems, receiver, receiverItems } = values;

    const pendingTrade = await (tx ?? this.db)
      .insert(tradesTable)
      .values({
        ...values,
        status,
        statusedAt: sql<Date>`now()`,
        senderId: sender.id,
        receiverId: receiver.id,
      })
      .returning()
      .then(([trade]) => ({
        ...trade!,
        status: trade!.status as typeof status,
        sender,
        receiver,
      }));

    const [tradesToSenderItems, tradesToReceiverItems] = await Promise.all([
      this.tradesToUserItemsService.createTradesToSenderItems(
        senderItems.map((senderItem) => ({
          trade: pendingTrade,
          senderItem,
        })),
        tx,
      ),
      this.tradesToUserItemsService.createTradesToReceiverItems(
        receiverItems.map((receiverItem) => ({
          trade: pendingTrade,
          receiverItem,
        })),
        tx,
      ),
    ]);

    return {
      pendingTrade,
      tradesToSenderItems,
      tradesToReceiverItems,
    };
  }

  public async updatePendingTradeToCancelledTrade(
    pendingTrade: PendingTradeEntity,
    tx?: Transaction,
  ): Promise<CancelledTradeEntity> {
    const status = 'CANCELLED';
    const { sender, receiver } = pendingTrade;

    return (tx ?? this.db)
      .update(tradesTable)
      .set({
        status,
        statusedAt: sql<Date>`now()`,
      })
      .returning()
      .then(([trade]) => ({
        ...trade!,
        status: trade!.status as typeof status,
        sender,
        receiver,
      }));
  }

  public async updatePendingTradeToAcceptedTrade(
    pendingTrade: PendingTradeEntity,
    tx?: Transaction,
  ): Promise<AcceptedTradeEntity> {
    const status = 'ACCEPTED';
    const { sender, receiver } = pendingTrade;

    return (tx ?? this.db)
      .update(tradesTable)
      .set({
        status,
        statusedAt: sql<Date>`now()`,
      })
      .returning()
      .then(([trade]) => ({
        ...trade!,
        status: trade!.status as typeof status,
        sender,
        receiver,
      }));
  }

  public async updatePendingTradeToRejectedTrade(
    pendingTrade: PendingTradeEntity,
    tx?: Transaction,
  ): Promise<RejectedTradeEntity> {
    const status = 'REJECTED';
    const { sender, receiver } = pendingTrade;

    return (tx ?? this.db)
      .update(tradesTable)
      .set({
        status,
        statusedAt: sql<Date>`now()`,
      })
      .returning()
      .then(([trade]) => ({
        ...trade!,
        status: trade!.status as typeof status,
        sender,
        receiver,
      }));
  }
}
