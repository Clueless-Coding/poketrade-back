import { Injectable } from '@nestjs/common';
import { Database, Transaction } from 'src/infra/postgres/types';
import {
  tradesTable,
  usersTable,
} from 'src/infra/postgres/tables';
import {
  TradeEntity,
  PendingTradeEntity,
  CancelledTradeEntity,
  AcceptedTradeEntity,
  RejectedTradeEntity,
  CreatePendingTradeEntityValues,
  TradeStatus,
} from 'src/core/entities/trade.entity'
import {
  TradeToSenderItemEntity,
  TradeToReceiverItemEntity,
} from 'src/core/entities/trade-to-user-item.entity'
import { InjectDatabase } from 'src/infra/ioc/decorators/inject-database.decorator';
import { and, eq, inArray, sql, SQL } from 'drizzle-orm';
import { Optional, PaginatedArray, UUIDv4 } from 'src/common/types';
import { alias } from 'drizzle-orm/pg-core';
import { AppEntityNotFoundException } from 'src/core/exceptions';
import { FindEntitiesOptions, FindEntitiesWithPaginationOptions, FindEntityByIdOptions, FindEntityOptions } from 'src/core/types';
import { FindPendingTradesWhere, FindTradesWhere, ITradesRepository } from 'src/core/repositories/trades.repository';
import { ITradesToUserItemsRepository } from 'src/core/repositories/trades-to-user-items.repository';
import { mapArrayToPaginatedArray } from 'src/common/helpers/map-array-to-paginated-array.helper';
import { transformPaginationOptions } from 'src/common/helpers/transform-pagination-options.helper';
import { calculateOffsetFromPaginationOptions } from 'src/common/helpers/calculate-offset-from-pagination-options.helper';
import { getTotalPaginationMeta } from 'src/common/helpers/get-total-pagination-meta.helper';

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
export class TradesRepository implements ITradesRepository {
  public constructor(
    @InjectDatabase()
    private readonly db: Database,

    private readonly tradesToUserItemsRepository: ITradesToUserItemsRepository,
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

  public async findTradesWithPagination(
    options: FindEntitiesWithPaginationOptions<FindTradesWhere>,
  ): Promise<PaginatedArray<TradeEntity>> {
    const {
      paginationOptions,
      where = {},
    } = options;

    const transformedPaginationOptions = transformPaginationOptions(paginationOptions);

    const { page, limit } = transformedPaginationOptions;
    const offset = calculateOffsetFromPaginationOptions(transformedPaginationOptions);

    const { totalItems, totalPages } = await getTotalPaginationMeta({
      db: this.db,
      table: tradesTable,
      whereSQL: this.mapWhereToSQL(where),
      limit,
    });

    return this
      .baseSelectBuilder(options)
      .offset(offset)
      .limit(limit)
      .then((rows) => mapArrayToPaginatedArray(
        rows.map((row) => mapTradesRowToEntity(row)),
        { page, limit, totalItems, totalPages },
      ));
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

  public findTradeById(options: FindEntityByIdOptions<UUIDv4>): Promise<TradeEntity> {
    const {
      id,
      notFoundErrorMessageFn = (id) => `Trade (\`${id}\`) not found`,
    } = options;

    return this.findTrade({
      where: { id },
      notFoundErrorMessage: notFoundErrorMessageFn(id),
    });
  }

  public async findPendingTrade(
    options: FindEntityOptions<FindPendingTradesWhere>,
  ): Promise<PendingTradeEntity> {
    const {
      notFoundErrorMessage = 'Pending trade not found',
    } = options;
    const status = TradeStatus.PENDING;

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
    options: FindEntityByIdOptions<UUIDv4>,
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
    const status = TradeStatus.PENDING;
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
      this.tradesToUserItemsRepository.createTradesToSenderItems(
        senderItems.map((senderItem) => ({
          trade: pendingTrade,
          senderItem,
        })),
        tx,
      ),
      this.tradesToUserItemsRepository.createTradesToReceiverItems(
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
    const status = TradeStatus.CANCELLED;
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
    const status = TradeStatus.ACCEPTED;
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
    const status = TradeStatus.REJECTED;
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
