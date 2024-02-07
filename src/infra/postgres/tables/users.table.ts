import { relations } from 'drizzle-orm';
import { pgTable, text, integer } from 'drizzle-orm/pg-core';
import { baseColumns } from '../base-columns';
import { openedPacksTable } from './opened-packs.table';
import { quickSoldItemsTable } from './quick-sold-items.table';
import { userItemsTable } from './user-items.table';

export const usersTable = pgTable('users', {
  ...baseColumns,
  name: text('name')
    .notNull()
    .unique(),
  hashedPassword: text('hashed_password')
    .notNull(),
  balance: integer('balance')
    .notNull()
    .default(0),
});

export const usersTableRelations = relations(usersTable, ({ many }) => ({
  items: many(userItemsTable),
  openedPacks: many(openedPacksTable),
  quickSoldItems: many(quickSoldItemsTable),
}));
