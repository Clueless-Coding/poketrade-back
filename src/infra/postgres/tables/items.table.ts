import { integer, pgTable } from "drizzle-orm/pg-core";
import { baseIdColumn, baseCreatedAtColumn } from '../base-columns';
import { pokemonsTable } from "./pokemons.table";
import { relations } from "drizzle-orm";

export const itemsTable = pgTable('items', {
  ...baseIdColumn,
  ...baseCreatedAtColumn,
  pokemonId: integer('pokemon_id')
    .notNull()
    .references(() => pokemonsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
});

export const itemsTableRelations = relations(itemsTable, ({ one }) => ({
  pokemon: one(pokemonsTable, {
    fields: [itemsTable.pokemonId],
    references: [pokemonsTable.id],
  }),
}));
