import { relations } from 'drizzle-orm';
import { uuid, pgTable, timestamp } from 'drizzle-orm/pg-core';
import { UUIDv4 } from 'src/common/types';
import { pokemons } from './pokemons.table';
import { userItemsColumns } from './user-items.table';
import { users } from './users.table';

export const quickSoldUserItems = pgTable('quick_sold_user_items', {
  ...userItemsColumns,
  // NOTE: Overriding id column without default value
  id: uuid('id')
    .$type<UUIDv4>()
    .notNull()
    .primaryKey(),
  soldAt: timestamp('sold_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const quickSoldUserItemsRelations = relations(quickSoldUserItems, ({ one }) => ({
  user: one(users),
  pokemon: one(pokemons),
}));
