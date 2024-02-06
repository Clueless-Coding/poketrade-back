import { SQL, count } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";
import { Database } from "src/infra/postgres/types";
import { Optional } from "../types";

export const getTotalPaginationMeta = async (options: {
  db: Database,
  table: PgTable,
  whereSQL: Optional<SQL>,
  limit: number,
}): Promise<{ totalItems: number, totalPages: number }> => {
  const {
    db,
    table,
    whereSQL,
    limit,
  } = options;

  const totalItems = await db
    .select({ totalItems: count() })
    .from(table)
    .where(whereSQL)
    .then(([row]) => row!.totalItems);

  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, totalPages };
}
