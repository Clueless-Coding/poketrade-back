import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as tables from './infra/postgres/tables';
import { and, eq, getTableColumns } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
const {
  tradesTable,
  usersTable,
  tradesToItemsTable,
} = tables;

(async () => {
  const client = new Client({
    host: "127.0.0.1",
    port: 5432,
    user: "postgres",
    password: "postgres",
    database: "poketrade",
  });
  await client.connect();
  const db = drizzle(client, { schema: tables });

  const sendersTable = alias(usersTable, 'senders');
  const receiversTable = alias(usersTable, 'receivers');

  const senderItemsTable = alias(tradesToItemsTable, 'senderItems');
  const receiverItemsTable = alias(tradesToItemsTable, 'receiverItems');

  const query = db
    .select({
      ...getTableColumns(tradesTable),
      senderId: sendersTable.id,
      receiverId: receiversTable.id,
      senderItemId: senderItemsTable.itemId,
      receiverItemId: receiverItemsTable.itemId,
    })
    .from(tradesTable)
    .innerJoin(sendersTable, eq(sendersTable.id, tradesTable.senderId))
    .innerJoin(receiversTable, eq(receiversTable.id, tradesTable.receiverId))
    .innerJoin(senderItemsTable, and(
      eq(senderItemsTable.tradeId, tradesTable.id),
      eq(senderItemsTable.userType, 'SENDER'),
    ))
    .innerJoin(receiverItemsTable, and(
      eq(senderItemsTable.tradeId, tradesTable.id),
      eq(senderItemsTable.userType, 'RECEIVER'),
    ))
    .groupBy(tradesTable.id)
  ;

  console.log(query.toSQL());
  const rows = await query;

})();
