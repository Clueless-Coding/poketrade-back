import { relations } from 'drizzle-orm';
import { index, pgEnum, pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { UUIDv4 } from 'src/common/types';
import { TradeEntity, tradesTable } from './trades.table';
import { UserItemEntity, userItemsTable } from './user-items.table';

const userTypeEnum = pgEnum('trades_to_user_items_user_type', [
  'SENDER',
  'RECEIVER',
]);

export const tradesToUserItemsTable = pgTable('trades_to_user_items', {
  tradeId: uuid('trade_id')
    .$type<UUIDv4>()
    .notNull()
    .references(() => tradesTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  userType: userTypeEnum('user_type')
    .notNull(),
  userItemId: uuid('user_item_id')
    .$type<UUIDv4>()
    .notNull()
    .references(() => userItemsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, (table) => ({
  primaryKey: primaryKey({ columns: [table.tradeId, table.userItemId] }),
  tradeIdIdx: index().on(table.tradeId),
  userTypeIdx: index().on(table.userType),
  userItemIdIdx: index().on(table.userItemId),
}))

export const tradesToUserItemsTableRelations = relations(tradesToUserItemsTable, ({ one }) => ({
  trade: one(tradesTable, {
    fields: [tradesToUserItemsTable.tradeId],
    references: [tradesTable.id],
  }),
  userItem: one(userItemsTable, {
    fields: [tradesToUserItemsTable.userItemId],
    references: [userItemsTable.id],
  }),
}));

export type TradeToUserItemUserType = typeof userTypeEnum.enumValues[number];

export type TradeToUserItemEntity = typeof tradesToUserItemsTable.$inferSelect & {
  trade: TradeEntity,
  userItem: UserItemEntity,
}
export type TradeToSenderItemEntity = Omit<TradeToUserItemEntity, 'userType' | 'userItem'> & {
  userType: 'SENDER',
  senderItem: UserItemEntity,
}
export type TradeToReceiverItemEntity = Omit<TradeToUserItemEntity, 'userType' | 'userItem'> & {
  userType: 'RECEIVER',
  receiverItem: UserItemEntity,
}

export type CreateTradeToUserItemEntityValues = Omit<typeof tradesToUserItemsTable.$inferInsert, 'tradeId' | 'userItemId'> & {
  trade: TradeEntity,
  userItem: UserItemEntity,
}
export type CreateTradeToSenderItemEntityValues = Omit<CreateTradeToUserItemEntityValues, 'userType' | 'userItem'> & {
  senderItem: UserItemEntity,
};
export type CreateTradeToReceiverItemEntityValues = Omit<CreateTradeToUserItemEntityValues, 'userType' | 'userItem'> & {
  receiverItem: UserItemEntity,
};
