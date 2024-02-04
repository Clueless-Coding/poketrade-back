import { relations } from 'drizzle-orm';
import { pgTable, text, integer } from 'drizzle-orm/pg-core';
import { packsToPokemonsTable } from './packs-to-pokemons.table';

export const pokemonsTable = pgTable('pokemons', {
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

export const pokemonsTableRelations = relations(pokemonsTable, ({ many }) => ({
  packsToPokemons: many(packsToPokemonsTable),
}));
