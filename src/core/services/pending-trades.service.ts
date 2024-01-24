import { Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { zip } from 'lodash';
import { Nullable, UUIDv4 } from 'src/common/types';
import { InjectDatabase } from 'src/infra/decorators/inject-database.decorator';
import { Database, Transaction } from 'src/infra/postgres/other/types';
import { AcceptedTradeEntity, CancelledTradeEntity, CreatePendingTradeEntityValues, PendingTradeEntity, RejectedTradeEntity, tradesTable, tradesToReceiverItemsTable, tradesToSenderItemsTable, TradeToReceiverItemEntity, TradeToSenderItemEntity, usersTable } from 'src/infra/postgres/tables';
import { TradesService } from './trades.service';

type Where = Partial<{
  id: UUIDv4,
  ids: Array<UUIDv4>,
}>;

type FindOptions = Partial<{
  where: Where,
}>;

@Injectable()
export class PendingTradesService {
  public constructor(
    @InjectDatabase()
    private readonly db: Database,

    private readonly tradesService: TradesService,
  ) {}

  public async findOne(
    findOptions: FindOptions,
  ): Promise<Nullable<PendingTradeEntity>> {
    const status = 'PENDING';

    return this.tradesService
      .findOne({
        ...findOptions,
        where: {
          ...findOptions.where,
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


  public async createOne(
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
      senderItems.length ? (tx ?? this.db)
        .insert(tradesToSenderItemsTable)
        .values(senderItems.map((senderItem) => ({
          tradeId: pendingTrade.id,
          senderItemId: senderItem.id,
        })))
        .returning()
        .then((tradesToSenderItems) => zip(senderItems, tradesToSenderItems).map(([senderItem, tradeToSenderItem]) => ({
          ...tradeToSenderItem!,
          trade: pendingTrade,
          senderItem: senderItem!,
        }))) : [],
      receiverItems.length ? (tx ?? this.db)
        .insert(tradesToReceiverItemsTable)
        .values(receiverItems.map((receiverItem) => ({
          tradeId: pendingTrade.id,
          receiverItemId: receiverItem.id,
        })))
        .returning()
        .then((tradesToReceiverItems) => zip(receiverItems, tradesToReceiverItems).map(([receiverItem, tradeToReceiverItem]) => ({
          ...tradeToReceiverItem!,
          trade: pendingTrade,
          receiverItem: receiverItem!,
        }))) : [],
    ]);

    return {
      pendingTrade,
      tradesToSenderItems,
      tradesToReceiverItems,
    };
  }

  public async updateOneToCancelled(
    pendingTrade: PendingTradeEntity,
    tx?: Transaction,
  ): Promise<CancelledTradeEntity> {
    const status = 'CANCELLED';
    const { sender, receiver } = pendingTrade;

    return (tx ?? this.db)
      .update(tradesTable)
      .set({
        status,
        cancelledAt: sql<Date>`now()`,
      })
      .returning()
      .then(([trade]) => ({
        ...trade!,
        status: trade!.status as typeof status,
        cancelledAt: trade!.cancelledAt!,
        sender,
        receiver,
      }));
  }

  public async updateOneToAccepted(
    pendingTrade: PendingTradeEntity,
    tx?: Transaction,
  ): Promise<AcceptedTradeEntity> {
    const status = 'ACCEPTED';
    const { sender, receiver } = pendingTrade;

    return (tx ?? this.db)
      .update(tradesTable)
      .set({
        status,
        acceptedAt: sql<Date>`now()`,
      })
      .returning()
      .then(([trade]) => ({
        ...trade!,
        status: trade!.status as typeof status,
        acceptedAt: trade!.acceptedAt!,
        sender,
        receiver,
      }));
  }

  public async updateOneToRejected(
    pendingTrade: PendingTradeEntity,
    tx?: Transaction,
  ): Promise<RejectedTradeEntity> {
    const status = 'REJECTED';
    const { sender, receiver } = pendingTrade;

    return (tx ?? this.db)
      .update(tradesTable)
      .set({
        status,
        rejectedAt: sql<Date>`now()`,
      })
      .returning()
      .then(([trade]) => ({
        ...trade!,
        status: trade!.status as typeof status,
        rejectedAt: trade!.rejectedAt!,
        sender,
        receiver,
      }));
  }
}
