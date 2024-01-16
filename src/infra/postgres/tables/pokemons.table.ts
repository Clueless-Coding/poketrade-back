import { pgTable, text, integer } from 'drizzle-orm/pg-core';

export const pokemons = pgTable('pokemons', {
  id: integer('id')
    .notNull()
    .primaryKey(),
  name: text('name')
    .notNull(),
  worth: integer('worth')
    .notNull(),
  height: integer('height')
    .notNull(),
  weight: integer('weight')
    .notNull(),
  image: text('image')
    .notNull(),
})

export type PokemonEntity = typeof pokemons.$inferSelect;
