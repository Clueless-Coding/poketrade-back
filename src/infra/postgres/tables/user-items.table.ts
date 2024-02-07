import { uuid, pgTable, timestamp, index } from 'drizzle-orm/pg-core';
import { usersTable } from './users.table';
import { UUIDv4 } from 'src/common/types';
import { relations } from 'drizzle-orm';
import { itemsTable } from './items.table';

export const userItemsTable = pgTable('user_items', {
  itemId: uuid('item_id')
    .notNull()
    .primaryKey()
    .$type<UUIDv4>()
    .references(() => itemsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  userId: uuid('user_id')
    .$type<UUIDv4>()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  receivedAt: timestamp('received_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => ({
    userIdIdx: index().on(table.userId),
}));

export const userItemsTableRelations = relations(userItemsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [userItemsTable.userId],
    references: [usersTable.id],
  }),
  item: one(itemsTable, {
    fields: [userItemsTable.itemId],
    references: [itemsTable.id],
  }),
}));
