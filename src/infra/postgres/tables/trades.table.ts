import { relations } from 'drizzle-orm';
import { uuid, pgTable, timestamp, index, pgEnum } from 'drizzle-orm/pg-core';
import { UUIDv4 } from 'src/common/types';
import { baseColumns } from '../base-columns';
import { usersTable } from './users.table';
import { tradeStatusEnumValues } from 'src/core/entities/trade.entity';

export const statusEnum = pgEnum('trades_status', tradeStatusEnumValues);

export const tradesTable = pgTable('trades', {
  ...baseColumns,
  status: statusEnum('status')
    .notNull(),
  senderId: uuid('sender_id')
    .$type<UUIDv4>()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  receiverId: uuid('receiver_id')
    .$type<UUIDv4>()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  statusedAt: timestamp('statused_at', { withTimezone: true })
    .notNull(),
}, (table) => ({
  statusIdx: index().on(table.status),
}));

export const tradesTableRelations = relations(tradesTable, ({ one }) => ({
  sender: one(usersTable, {
    fields: [tradesTable.senderId],
    references: [usersTable.id],
  }),
  receiver: one(usersTable, {
    fields: [tradesTable.receiverId],
    references: [usersTable.id],
  }),
}))
