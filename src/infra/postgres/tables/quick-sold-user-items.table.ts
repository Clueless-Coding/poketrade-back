import { relations } from 'drizzle-orm';
import { uuid, pgTable, timestamp } from 'drizzle-orm/pg-core';
import { UUIDv4 } from 'src/common/types';
import { pokemonsTable } from './pokemons.table';
import { userItemsTableColumns } from './user-items.table';
import { usersTable } from './users.table';

export const quickSoldUserItemsTable = pgTable('quick_sold_user_items', {
  ...userItemsTableColumns,
  // NOTE: Overriding id column without default value
  id: uuid('id')
    .$type<UUIDv4>()
    .notNull()
    .primaryKey(),
  // NOTE: Overriding received_at column without default value
  receivedAt: timestamp('received_at', { withTimezone: true })
    .notNull(),
  soldAt: timestamp('sold_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const quickSoldUserItemsTableRelations = relations(quickSoldUserItemsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [quickSoldUserItemsTable.userId],
    references: [usersTable.id],
  }),
  pokemon: one(pokemonsTable, {
    fields: [quickSoldUserItemsTable.pokemonId],
    references: [pokemonsTable.id],
  }),
}));
