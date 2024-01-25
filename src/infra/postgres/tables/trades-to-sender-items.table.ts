import { relations } from 'drizzle-orm';
import { uuid, pgTable, index, primaryKey } from 'drizzle-orm/pg-core';
import { UUIDv4 } from 'src/common/types';
import { TradeEntity, tradesTable } from './trades.table';
import { UserItemEntity, userItemsTable } from './user-items.table';

// TODO: Merge two tables `trades_to_sender_items` and `trades_to_receiver_items`
// to one table `trades_to_user_items` with extra enum column `user_type` with values: 'SENDER' | 'RECEIVER'
export const tradesToSenderItemsTable = pgTable('trades_to_sender_items', {
  tradeId: uuid('trade_id')
    .$type<UUIDv4>()
    .notNull()
    .references(() => tradesTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  senderItemId: uuid('sender_item_id')
    .$type<UUIDv4>()
    .notNull()
    .references(() => userItemsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, (table) => ({
  primaryKey: primaryKey({ columns: [table.tradeId, table.senderItemId] }),
  tradeIdIdx: index().on(table.tradeId),
  senderItemIdIdx: index().on(table.senderItemId),
}));

export const tradesToSenderItemsTableRelations = relations(tradesToSenderItemsTable, ({ one }) => ({
  trade: one(tradesTable, {
    fields: [tradesToSenderItemsTable.tradeId],
    references: [tradesTable.id],
  }),
  senderItem: one(userItemsTable, {
    fields: [tradesToSenderItemsTable.senderItemId],
    references: [userItemsTable.id],
  }),
}));

export type TradeToSenderItemEntity = typeof tradesToSenderItemsTable.$inferSelect & {
  trade: TradeEntity,
  senderItem: UserItemEntity,
};
export type CreateTradeToSenderItemEntityValues = Omit<typeof tradesToSenderItemsTable.$inferInsert, 'tradeId' | 'senderItemId'> & {
  trade: TradeEntity,
  senderItem: UserItemEntity,
}
