import { relations } from 'drizzle-orm';
import { uuid, pgTable, timestamp, index, pgEnum } from 'drizzle-orm/pg-core';
import { UUIDv4 } from 'src/common/types';
import { baseColumns } from '../base-columns';
import { UserItemEntity } from './user-items.table';
import { UserEntity, usersTable } from './users.table';
import { tradesToUserItemsTable } from './trades-to-user-items.table';

export const statusEnum = pgEnum('trades_status', [
  'PENDING',
  'CANCELLED',
  'ACCEPTED',
  'REJECTED',
]);

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

export const tradesTableRelations = relations(tradesTable, ({ one, many }) => ({
  sender: one(usersTable, {
    fields: [tradesTable.senderId],
    references: [usersTable.id],
  }),
  receiver: one(usersTable, {
    fields: [tradesTable.receiverId],
    references: [usersTable.id],
  }),
}))

export type TradeStatus = typeof statusEnum.enumValues[number];

export type TradeEntity = typeof tradesTable.$inferSelect & {
  sender: UserEntity,
  receiver: UserEntity,
};

export type PendingTradeEntity = Omit<TradeEntity, 'status'> & {
  status: 'PENDING'
};
export type CancelledTradeEntity = Omit<TradeEntity, 'status'> & {
  status: 'CANCELLED',
};
export type AcceptedTradeEntity = Omit<TradeEntity, 'status'> & {
  status: 'ACCEPTED',
};
export type RejectedTradeEntity = Omit<TradeEntity, 'status'> & {
  status: 'REJECTED',
};

export type CreatePendingTradeEntityValues = Omit<
  typeof tradesTable.$inferInsert,
  | 'status'
  | 'statusedAt'
  | 'senderId'
  | 'receiverId'> & {
  sender: UserEntity,
  senderItems: Array<UserItemEntity>,
  receiver: UserEntity,
  receiverItems: Array<UserItemEntity>,
};
