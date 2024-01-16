import { relations } from 'drizzle-orm';
import { pgTable, text, integer } from 'drizzle-orm/pg-core';
import { baseColumns } from '../other/base-columns';
import { openedPacks } from './opened-packs.table';
import { quickSoldUserItems } from './quick-sold-user-items.table';
import { userItems } from './user-items.table';

export const users = pgTable('users', {
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

export const usersRelations = relations(users, ({ many }) => ({
  items: many(userItems),
  openedPacks: many(openedPacks),
  quickSoldItems: many(quickSoldUserItems),
}))

export type UserEntity = typeof users.$inferSelect;
