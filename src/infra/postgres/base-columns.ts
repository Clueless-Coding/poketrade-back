import { uuid, timestamp } from 'drizzle-orm/pg-core';
import { UUIDv4 } from 'src/common/types';

export const baseIdColumn = {
  id: uuid('id')
    .$type<UUIDv4>()
    .notNull()
    .primaryKey()
    .defaultRandom(),
};

export const baseCreatedAtColumn = {
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
};

export const baseUpdatedAtColumn = {
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
};

export const baseColumns = {
  ...baseIdColumn,
  ...baseCreatedAtColumn,
  ...baseUpdatedAtColumn,
}
