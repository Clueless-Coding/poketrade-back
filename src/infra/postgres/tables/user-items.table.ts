import { uuid, integer, pgTable, timestamp } from 'drizzle-orm/pg-core';
import { baseIdColumn } from '../other/base-columns';
import { users } from './users.table';
import { pokemons } from './pokemons.table';
import { UUIDv4 } from 'src/common/types';
import { relations } from 'drizzle-orm';

export const userItemsColumns = {
  ...baseIdColumn,
  receivedAt: timestamp('received_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  userId: uuid('user_id')
    .$type<UUIDv4>()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  pokemonId: integer('pokemon_id')
    .notNull()
    .references(() => pokemons.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}

export const userItems = pgTable('user_items', userItemsColumns);

export const userItemsRelations = relations(userItems, ({ one }) => ({
  user: one(users),
  pokemon: one(pokemons),
}));
