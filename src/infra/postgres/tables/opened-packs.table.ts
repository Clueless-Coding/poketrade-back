import { uuid, pgTable, timestamp } from 'drizzle-orm/pg-core';
import { baseIdColumn } from '../base-columns';
import { usersTable } from './users.table';
import { packsTable } from './packs.table';
import { UUIDv4 } from 'src/common/types';
import { relations } from 'drizzle-orm';
import { itemsTable } from './items.table';

export const openedPacksTable = pgTable('opened_packs', {
  ...baseIdColumn,
  openedAt: timestamp('opened_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  userId: uuid('user_id')
    .$type<UUIDv4>()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  packId: uuid('pack_id')
    .$type<UUIDv4>()
    .notNull()
    .references(() => packsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  itemId: uuid('item_id')
    .$type<UUIDv4>()
    .notNull()
    .references(() => itemsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
})

export const openedPacksTableRelations = relations(openedPacksTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [openedPacksTable.userId],
    references: [usersTable.id],
  }),
  pack: one(packsTable, {
    fields: [openedPacksTable.packId],
    references: [packsTable.id],
  }),
  item: one(itemsTable, {
    fields: [openedPacksTable.itemId],
    references: [itemsTable.id],
  }),
}));
