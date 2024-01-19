import { relations } from 'drizzle-orm';
import { pgTable, text, integer } from 'drizzle-orm/pg-core';
import { packPokemons } from './pack-pokemons.table';

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
});

export const pokemonsRelations = relations(pokemons, ({ many }) => ({
  packPokemons: many(packPokemons),
}));
