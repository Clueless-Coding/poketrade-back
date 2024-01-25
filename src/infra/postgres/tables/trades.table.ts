import { relations } from 'drizzle-orm';
import { uuid, pgTable, timestamp, index, pgEnum } from 'drizzle-orm/pg-core';
import { UUIDv4 } from 'src/common/types';
import { baseColumns } from '../other/base-columns';
import { tradesToReceiverItemsTable } from './trades-to-receiver-items.table';
import { tradesToSenderItemsTable } from './trades-to-sender-items.table';
import { UserItemEntity } from './user-items.table';
import { UserEntity, usersTable } from './users.table';

export const tradeStatusEnum = pgEnum('trade_status', [
  'PENDING',
  'CANCELLED',
  'ACCEPTED',
  'REJECTED',
]);

export const tradesTable = pgTable('trades', {
  ...baseColumns,
  status: tradeStatusEnum('status')
    .notNull(),
  senderId: uuid('sender_id')
    .$type<UUIDv4>()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  receiverId: uuid('receiver_id')
    .$type<UUIDv4>()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  rejectedAt: timestamp('rejected_at', { withTimezone: true }),
}, (table) => ({
  statusIdx: index().on(table.status),
}));

export const tradesTableRelations = relations(tradesTable, ({ one, many }) => ({
  sender: one(usersTable, {
    fields: [tradesTable.senderId],
    references: [usersTable.id],
  }),
  tradesToSenderItems: many(tradesToSenderItemsTable),
  receiver: one(usersTable, {
    fields: [tradesTable.receiverId],
    references: [usersTable.id],
  }),
  tradesToReceiverItems: many(tradesToReceiverItemsTable),
}))

export type TradeStatus = typeof tradeStatusEnum.enumValues[number];

export type TradeEntity = typeof tradesTable.$inferSelect & {
  sender: UserEntity,
  receiver: UserEntity,
};

export type PendingTradeEntity = Omit<TradeEntity,
  |'status'
  | 'cancelledAt'
  | 'acceptedAt'
  | 'rejectedAt'> & {
  status: 'PENDING'
};
export type CreatePendingTradeEntityValues = Omit<
  typeof tradesTable.$inferInsert,
  | 'status'
  | 'cancelledAt'
  | 'acceptedAt'
  | 'rejectedAt'
  | 'senderId'
  | 'receiverId'> & {
  sender: UserEntity,
  senderItems: Array<UserItemEntity>,
  receiver: UserEntity,
  receiverItems: Array<UserItemEntity>,
};
export type CancelledTradeEntity = Omit<TradeEntity,
  |'status'
  | 'cancelledAt'
  | 'acceptedAt'
  | 'rejectedAt'> & {
  status: 'CANCELLED',
  cancelledAt: Date,
};
export type AcceptedTradeEntity = Omit<TradeEntity,
  |'status'
  | 'cancelledAt'
  | 'acceptedAt'
  | 'rejectedAt'> & {
  status: 'ACCEPTED',
  acceptedAt: Date,
};
export type RejectedTradeEntity = Omit<TradeEntity,
  |'status'
  | 'cancelledAt'
  | 'acceptedAt'
  | 'rejectedAt'> & {
  status: 'REJECTED',
  rejectedAt: Date,
};
// export type TradeEntity =
//   | PendingTradeEntity
//   | CancelledTradeEntity
//   | AcceptedTradeEntity
//   | RejectedTradeEntity
