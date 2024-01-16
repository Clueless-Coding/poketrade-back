import { uuid, pgTable, integer, timestamp } from 'drizzle-orm/pg-core';
import { baseIdColumn } from '../other/base-columns';
import { users } from './users.table';
import { packs } from './packs.table';
import { pokemons } from './pokemons.table';
import { UUIDv4 } from 'src/common/types';
import { relations } from 'drizzle-orm';

export const openedPacks = pgTable('opened_packs', {
  ...baseIdColumn,
  openedAt: timestamp('opened_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  userId: uuid('user_id')
    .$type<UUIDv4>()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  packId: uuid('pack_id')
    .$type<UUIDv4>()
    .notNull()
    .references(() => packs.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  pokemonId: integer('pokemon_id')
    .notNull()
    .references(() => pokemons.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
})

export const openedPacksRelations = relations(openedPacks, ({ one }) => ({
  user: one(users),
  pack: one(packs),
  pokemon: one(pokemons),
}))

export type OpenedPackEntity = typeof openedPacks.$inferSelect;
