import { relations } from 'drizzle-orm';
import { integer, pgTable, text } from 'drizzle-orm/pg-core';
import { baseColumns } from '../other/base-columns';
import { packPokemons } from './pack-pokemons.table';

export const packs = pgTable('packs', {
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

export const packsRelations = relations(packs, ({ many }) => ({
  packPokemons: many(packPokemons),
}))
