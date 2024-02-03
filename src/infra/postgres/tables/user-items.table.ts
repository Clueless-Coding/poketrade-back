import { uuid, integer, pgTable, timestamp } from 'drizzle-orm/pg-core';
import { baseIdColumn } from '../base-columns';
import { UserEntity, usersTable } from './users.table';
import { PokemonEntity, pokemonsTable } from './pokemons.table';
import { UUIDv4 } from 'src/common/types';
import { relations } from 'drizzle-orm';
import { tradesToUserItemsTable } from './trades-to-user-items.table';

export const userItemsTableColumns = {
  ...baseIdColumn,
  receivedAt: timestamp('received_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  userId: uuid('user_id')
    .$type<UUIDv4>()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  pokemonId: integer('pokemon_id')
    .notNull()
    .references(() => pokemonsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}

export const userItemsTable = pgTable('user_items', userItemsTableColumns);

export const userItemsTableRelations = relations(userItemsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [userItemsTable.userId],
    references: [usersTable.id],
  }),
  pokemon: one(pokemonsTable, {
    fields: [userItemsTable.pokemonId],
    references: [pokemonsTable.id],
  }),
}));

export type UserItemEntity = typeof userItemsTable.$inferSelect & {
  user: UserEntity,
  pokemon: PokemonEntity,
}
export type CreateUserItemEntityValues = Omit<typeof userItemsTable.$inferInsert, 'id' | 'receivedAt' | 'userId' | 'pokemonId'> & {
  user: UserEntity,
  pokemon: PokemonEntity,
}
export type UpdateUserItemEntityValues = Partial<CreateUserItemEntityValues & {
  receivedAt: typeof userItemsTable.$inferInsert.receivedAt,
}>;
