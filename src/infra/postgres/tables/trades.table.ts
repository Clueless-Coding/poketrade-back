import { relations } from 'drizzle-orm';
import { uuid, pgTable, timestamp, index, pgEnum } from 'drizzle-orm/pg-core';
import { UUIDv4 } from 'src/common/types';
import { baseColumns } from '../other/base-columns';
import { tradeReceiverItems } from './trade-receiver-items.table';
import { tradeSenderItems } from './trade-sender-items.table';
import { users } from './users.table';

const tradeStatusEnum = pgEnum('trade_status', [
  'PENDING',
  'CANCELLED',
  'ACCEPTED',
  'REJECTED',
]);

export const trades = pgTable('trades', {
  ...baseColumns,
  status: tradeStatusEnum('status')
    .notNull(),
  senderId: uuid('sender_id')
    .$type<UUIDv4>()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  receiverId: uuid('receiver_id')
    .$type<UUIDv4>()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  cancelledAt: timestamp('accepted_at', { withTimezone: true }),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  rejectedAt: timestamp('rejected_at', { withTimezone: true }),
}, (table) => ({
  statusIdx: index().on(table.status),
}));

export const tradesRelations = relations(trades, ({ one, many }) => ({
  sender: one(users),
  senderItems: many(tradeSenderItems),
  receiver: one(users),
  receiverItems: many(tradeReceiverItems),
}))

export type TradeStatus = typeof tradeStatusEnum.enumValues[number];
