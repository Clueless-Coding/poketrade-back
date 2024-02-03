import { Injectable } from '@nestjs/common';
import { Database, Transaction } from 'src/infra/postgres/types';
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
import { InjectDatabase } from 'src/infra/ioc/decorators/inject-database.decorator';
import { and, eq, inArray, sql, SQL } from 'drizzle-orm';
import { Optional, UUIDv4 } from 'src/common/types';
import { alias } from 'drizzle-orm/pg-core';
import { TradesToUserItemsService } from './trades-to-user-items.service';
import { AppEntityNotFoundException } from '../exceptions';
import { FindEntitiesOptions, FindEntityByIdOptions, FindEntityOptions } from '../types';

export type FindTradesWhere = Partial<{
  id: UUIDv4,
  ids: Array<UUIDv4>
  status: TradeStatus,
}>;

export type FindPendingTradesWhere = Omit<FindTradesWhere, 'status'>;

export const mapTradesRowToEntity = (
  row: Record<'trades' | 'senders' | 'receivers', any>,
): TradeEntity => {
  return {
    ...row.trades,
    sender: row.senders,
    receiver: row.receivers,
  };
};

@Injectable()
export class TradesService {
  public constructor(
    @InjectDatabase()
    private readonly db: Database,

    private readonly tradesToUserItemsService: TradesToUserItemsService,
  ) {}

  private mapWhereToSQL(
    where: FindTradesWhere,
  ): Optional<SQL> {
    return and(
      where.id !== undefined ? eq(tradesTable.id, where.id) : undefined,
      where.ids !== undefined ? inArray(tradesTable.id, where.ids) : undefined,
      where.status !== undefined ? eq(tradesTable.status, where.status) : undefined,
    );
  }

  private baseSelectBuilder(
    options: FindEntitiesOptions<FindTradesWhere>,
  ) {
    const { where = {} } = options;

    const sendersTable = alias(usersTable, 'senders');
    const receiversTable = alias(usersTable, 'receivers');

    return this.db
      .select()
      .from(tradesTable)
      .innerJoin(sendersTable, eq(sendersTable.id, tradesTable.senderId))
      .innerJoin(receiversTable, eq(receiversTable.id, tradesTable.receiverId))
      .where(this.mapWhereToSQL(where));
  }

  public async findTrade(
    options: FindEntityOptions<FindTradesWhere>,
  ): Promise<TradeEntity> {
    const {
      notFoundErrorMessage = 'Trade not found',
    } = options;

    const trade = await this
      .baseSelectBuilder(options)
      .limit(1)
      .then(([row]) => (
        row
        ? mapTradesRowToEntity(row)
        : null
      ));

    if (!trade) {
      throw new AppEntityNotFoundException(notFoundErrorMessage);
    }

    return trade;
  }

  public async findPendingTrade(
    options: FindEntityOptions<FindPendingTradesWhere>,
  ): Promise<PendingTradeEntity> {
    const {
      notFoundErrorMessage = 'Pending trade not found',
    } = options;
    const status = 'PENDING';

    return this
      .findTrade({
        ...options,
        where: {
          ...options.where,
          status,
        },
        notFoundErrorMessage,
      })
      .then((trade) => ({
        ...trade,
        status: status as typeof status,
      }));
  }

  public async findPendingTradeById(
    options: FindEntityByIdOptions,
  ): Promise<PendingTradeEntity> {
    const {
      id,
      notFoundErrorMessageFn = (id) => `Pending trade (\`${id}\`) not found`,
    } = options;

    return this.findPendingTrade({
      where: { id },
      notFoundErrorMessage: notFoundErrorMessageFn(id),
    });
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
