import { relations } from 'drizzle-orm';
import { uuid, integer, pgTable, index, primaryKey } from 'drizzle-orm/pg-core';
import { UUIDv4 } from 'src/common/types';
import { packs } from './packs.table';
import { pokemons } from './pokemons.table';

export const packPokemons = pgTable('pack_pokemons', {
  packId: uuid('pack_id')
    .$type<UUIDv4>()
    .notNull()
    .references(() => packs.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  pokemonId: integer('pokemon_id')
    .notNull()
    .references(() => pokemons.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, (table) => ({
  primaryKey: primaryKey({ columns: [table.packId, table.pokemonId] }),
  packIdIdx: index().on(table.packId),
  pokemonIdIdx: index().on(table.pokemonId),
}));

export const packPokemonsRelations = relations(packPokemons, ({ one }) => ({
  pack: one(packs),
  pokemon: one(pokemons),
}));
