import { relations } from 'drizzle-orm';
import { uuid, integer, pgTable, index, primaryKey } from 'drizzle-orm/pg-core';
import { UUIDv4 } from 'src/common/types';
import { PackEntity, packsTable } from './packs.table';
import { PokemonEntity, pokemonsTable } from './pokemons.table';

export const packsToPokemonsTable = pgTable('packs_to_pokemons', {
  packId: uuid('pack_id')
    .$type<UUIDv4>()
    .notNull()
    .references(() => packsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  pokemonId: integer('pokemon_id')
    .notNull()
    .references(() => pokemonsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, (table) => ({
  primaryKey: primaryKey({ columns: [table.packId, table.pokemonId] }),
  packIdIdx: index().on(table.packId),
  pokemonIdIdx: index().on(table.pokemonId),
}));

export const packsToPokemonsTableRelations = relations(packsToPokemonsTable, ({ one }) => ({
  pack: one(packsTable, {
    fields: [packsToPokemonsTable.packId],
    references: [packsTable.id],
  }),
  pokemon: one(pokemonsTable, {
    fields: [packsToPokemonsTable.pokemonId],
    references: [pokemonsTable.id],
  }),
}));

export type PackToPokemonEntity = typeof packsToPokemonsTable.$inferSelect & {
  pack: PackEntity,
  pokemon: PokemonEntity,
}
