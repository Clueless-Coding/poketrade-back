import { relations } from 'drizzle-orm';
import { uuid, pgTable, index, primaryKey } from 'drizzle-orm/pg-core';
import { UUIDv4 } from 'src/common/types';
import { trades } from './trades.table';
import { userItems } from './user-items.table';

export const tradeSenderItems = pgTable('trade_sender_items', {
  tradeId: uuid('trade_id')
    .$type<UUIDv4>()
    .notNull()
    .references(() => trades.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  userItemId: uuid('user_item_id')
    .$type<UUIDv4>()
    .notNull()
    .references(() => trades.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, (table) => ({
  primaryKey: primaryKey({ columns: [table.tradeId, table.userItemId] }),
  tradeIdIdx: index().on(table.tradeId),
  userItemIdIdx: index().on(table.userItemId),
}));

export const tradeSenderItemsRelations = relations(tradeSenderItems, ({ one }) => ({
  trade: one(trades),
  userItem: one(userItems),
}));
