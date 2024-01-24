import { relations } from 'drizzle-orm';
import { uuid, pgTable, index, primaryKey } from 'drizzle-orm/pg-core';
import { UUIDv4 } from 'src/common/types';
import { TradeEntity, tradesTable } from './trades.table';
import { UserItemEntity, userItemsTable } from './user-items.table';

export const tradesToReceiverItemsTable = pgTable('trades_to_receiver_items', {
  tradeId: uuid('trade_id')
    .$type<UUIDv4>()
    .notNull()
    .references(() => tradesTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  receiverItemId: uuid('receiver_item_id')
    .$type<UUIDv4>()
    .notNull()
    .references(() => userItemsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, (table) => ({
  primaryKey: primaryKey({ columns: [table.tradeId, table.receiverItemId] }),
  tradeIdIdx: index().on(table.tradeId),
  receiverItemIdIdx: index().on(table.receiverItemId),
}));

export const tradesToReceiverItemsTableRelations = relations(tradesToReceiverItemsTable, ({ one }) => ({
  trade: one(tradesTable, {
    fields: [tradesToReceiverItemsTable.tradeId],
    references: [tradesTable.id],
  }),
  receiverItem: one(userItemsTable, {
    fields: [tradesToReceiverItemsTable.receiverItemId],
    references: [userItemsTable.id],
  }),
}));

export type TradeToReceiverItemEntity = typeof tradesToReceiverItemsTable.$inferSelect & {
  trade: TradeEntity,
  receiverItem: UserItemEntity,
};
export type CreateTradeToReceiverItemEntityValues = Omit<typeof tradesToReceiverItemsTable.$inferInsert, 'tradeId' | 'receiverItemId'> & {
  trade: TradeEntity,
  receiverItem: UserItemEntity,
}
