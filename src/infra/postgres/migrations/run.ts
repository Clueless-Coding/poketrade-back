import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';
import * as tables from 'src/infra/postgres/tables/';

const {
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_HOST,
  POSTGRES_DB,
  POSTGRES_PORT,
} = process.env;

(async () => {
  const client = new Client({
    connectionString: `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`,
  });

  await client.connect();
  const db = drizzle(client, { schema: tables });

  await migrate(db, { migrationsFolder: './src/infra/postgres/migrations/' })

  await client.end();
})();
