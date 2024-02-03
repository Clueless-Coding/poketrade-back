import { relations } from 'drizzle-orm';
import { integer, pgTable, text } from 'drizzle-orm/pg-core';
import { baseColumns } from '../base-columns';
import { packsToPokemonsTable } from './packs-to-pokemons.table';

export const packsTable = pgTable('packs', {
  ...baseColumns,
  name: text('name')
    .notNull(),
  description: text('description')
    .notNull(),
  price: integer('price')
    .notNull(),
  image: text('image')
    .notNull(),
})

export const packsTableRelations = relations(packsTable, ({ many }) => ({
  packsToPokemons: many(packsToPokemonsTable),
}))

export type PackEntity = typeof packsTable.$inferSelect;
export type CreatePackEntityValues = Omit<typeof packsTable.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePackEntityValues = Partial<CreatePackEntityValues>;
