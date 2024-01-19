import { Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { InjectDrizzle } from 'src/infra/postgres/postgres.module';
import * as tables from 'src/infra/postgres/tables';
import { BaseService } from './base.service';
import { PgInsertValue } from 'drizzle-orm/pg-core';
import {
  TradeEntity as TradeEntityDrizzle,
  Transaction,
  UserItemEntity as UserItemEntityDrizzle,
  PendingTradeEntity as PendingTradeEntityDrizzle,
  CancelledTradeEntity as CancelledTradeEntityDrizzle,
  AcceptedTradeEntity as AcceptedTradeEntityDrizzle,
  RejectedTradeEntity as RejectedTradeEntityDrizzle,
  EntityRelations,
} from 'src/infra/postgres/other/types';
import { tradeReceiverItems, tradeSenderItems } from 'src/infra/postgres/tables';
import { ExtractTablesWithRelations } from 'drizzle-orm';


@Injectable()
export class TradesService extends BaseService<'trades'> {
  public constructor(
    @InjectDrizzle()
    drizzle: NodePgDatabase<typeof tables>,
  ) {
    super('trades', drizzle);
  }

  public override async createOne(
    values: PgInsertValue<typeof tables['trades']> & {
      senderItems: Array<UserItemEntityDrizzle>,
      receiverItems: Array<UserItemEntityDrizzle>,
    },
    tx?: Transaction,
  ): Promise<TradeEntityDrizzle<{ senderItems: true, receiverItems: true }>> {
    const trade = await super.createOne(values, tx);

    const [senderItems, receiverItems] = await Promise.all([
      (tx ?? super.drizzle)
        .insert(tradeSenderItems)
        .values(values.senderItems.map((senderItem) => ({
          tradeId: trade.id,
          userItemId: senderItem.id,
        })))
        .returning(),
      (tx ?? super.drizzle)
        .insert(tradeReceiverItems)
        .values(values.receiverItems.map((receiverItem) => ({
          tradeId: trade.id,
          userItemId: receiverItem.id,
        })))
        .returning(),
    ]);

    return {
      ...trade,
      senderItems,
      receiverItems,
    };
  }

  public async createOnePending(
    values: Omit<PgInsertValue<typeof tables['trades']> & {
      senderItems: Array<UserItemEntityDrizzle>,
      receiverItems: Array<UserItemEntityDrizzle>,
    }, 'status'>,
    tx?: Transaction,
  ): Promise<PendingTradeEntityDrizzle<{ senderItems: true, receiverItems: true }>> {
    return this.createOne({
      ...values,
      status: 'PENDING',
    }, tx) as Promise<PendingTradeEntityDrizzle<{ senderItems: true, receiverItems: true }>>;
  }

  public async updateOneToCancelled<
    TEntityRelations extends EntityRelations<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>['trades']>,
  >(
    pendingTrade: PendingTradeEntityDrizzle<TEntityRelations>,
    tx?: Transaction,
  ): Promise<CancelledTradeEntityDrizzle<TEntityRelations>> {
    return super.updateOne(pendingTrade, {
      status: 'CANCELLED',
    }, tx) as Promise<CancelledTradeEntityDrizzle<TEntityRelations>>;
  }

  public async updateOneToAccepted<
    TEntityRelations extends EntityRelations<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>['trades']>,
  >(
    pendingTrade: PendingTradeEntityDrizzle<TEntityRelations>,
    tx?: Transaction,
  ): Promise<AcceptedTradeEntityDrizzle<TEntityRelations>> {
    return super.updateOne(pendingTrade, {
      status: 'ACCEPTED',
    }, tx) as Promise<AcceptedTradeEntityDrizzle<TEntityRelations>>;
  }

  public async updateOneToRejected<
    TEntityRelations extends EntityRelations<ExtractTablesWithRelations<typeof tables>, ExtractTablesWithRelations<typeof tables>['trades']>,
  >(
    pendingTrade: PendingTradeEntityDrizzle<TEntityRelations>,
    tx?: Transaction,
  ): Promise<RejectedTradeEntityDrizzle<TEntityRelations>> {
    return super.updateOne(pendingTrade, {
      status: 'REJECTED',
    }, tx) as Promise<RejectedTradeEntityDrizzle<TEntityRelations>>;
  }
}
