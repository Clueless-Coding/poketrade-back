import { ExtractTablesWithRelations } from 'drizzle-orm';
import * as tables from './tables';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { NodePgDatabase, NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';

export type Transaction = PgTransaction<NodePgQueryResultHKT, typeof tables, ExtractTablesWithRelations<typeof tables>>;
export type Database = NodePgDatabase<typeof tables>;
