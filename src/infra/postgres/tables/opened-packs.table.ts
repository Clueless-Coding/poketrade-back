import { uuid, pgTable, integer, timestamp } from 'drizzle-orm/pg-core';
import { baseIdColumn } from '../base-columns';
import { UserEntity, usersTable } from './users.table';
import { PackEntity, packsTable } from './packs.table';
import { PokemonEntity, pokemonsTable } from './pokemons.table';
import { UUIDv4 } from 'src/common/types';
import { relations } from 'drizzle-orm';

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
  pokemonId: integer('pokemon_id')
    .notNull()
    .references(() => pokemonsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
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
  pokemon: one(pokemonsTable, {
    fields: [openedPacksTable.pokemonId],
    references: [pokemonsTable.id],
  }),
}))

export type OpenedPackEntity = typeof openedPacksTable.$inferSelect & {
  user: UserEntity,
  pack: PackEntity,
  pokemon: PokemonEntity,
}
export type CreateOpenedPackEntityValues = Omit<typeof openedPacksTable.$inferInsert, 'id' | 'openedAt' | 'userId' | 'packId' | 'pokemonId'> & {
  user: UserEntity,
  pack: PackEntity,
  pokemon: PokemonEntity,
}
