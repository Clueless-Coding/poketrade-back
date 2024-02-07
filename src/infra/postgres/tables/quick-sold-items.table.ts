import { relations } from 'drizzle-orm';
import { uuid, pgTable, timestamp } from 'drizzle-orm/pg-core';
import { UUIDv4 } from 'src/common/types';
import { usersTable } from './users.table';
import { itemsTable } from './items.table';

export const quickSoldItemsTable = pgTable('quick_sold_items', {
  soldAt: timestamp('sold_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  userId: uuid('user_id')
    .$type<UUIDv4>()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  itemId: uuid('item_id')
    .$type<UUIDv4>()
    .notNull()
    .references(() => itemsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
})

export const quickSoldItemsTableRelations = relations(quickSoldItemsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [quickSoldItemsTable.userId],
    references: [usersTable.id],
  }),
  item: one(itemsTable, {
    fields: [quickSoldItemsTable.itemId],
    references: [itemsTable.id],
  }),
}));
