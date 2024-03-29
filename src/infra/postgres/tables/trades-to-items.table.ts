import { relations } from 'drizzle-orm';
import { index, pgEnum, pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { UUIDv4, UnionToArray } from 'src/common/types';
import { tradesTable } from './trades.table';
import { TradeToItemUserType } from 'src/core/enums/trade-to-item-user-type.enum';
import { itemsTable } from './items.table';

const userTypeEnumValues = Object.keys(TradeToItemUserType) as UnionToArray<keyof typeof TradeToItemUserType>;
export const userTypeEnum = pgEnum('trades_to_items_user_type', userTypeEnumValues);

export const tradesToItemsTable = pgTable('trades_to_items', {
  tradeId: uuid('trade_id')
    .$type<UUIDv4>()
    .notNull()
    .references(() => tradesTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  userType: userTypeEnum('user_type')
    .notNull(),
  itemId: uuid('item_id')
    .$type<UUIDv4>()
    .notNull()
    .references(() => itemsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, (table) => ({
  primaryKey: primaryKey({ columns: [table.tradeId, table.itemId] }),
  tradeIdIdx: index().on(table.tradeId),
  userTypeIdx: index().on(table.userType),
  itemIdIdx: index().on(table.itemId),
}))

export const tradesToItemsTableRelations = relations(tradesToItemsTable, ({ one }) => ({
  trade: one(tradesTable, {
    fields: [tradesToItemsTable.tradeId],
    references: [tradesTable.id],
  }),
  item: one(itemsTable, {
    fields: [tradesToItemsTable.itemId],
    references: [itemsTable.id],
  }),
}));
