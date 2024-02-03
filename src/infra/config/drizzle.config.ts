import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const {
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_HOST,
  POSTGRES_DB,
  POSTGRES_PORT,
} = process.env;

export default defineConfig({
  schema: './src/infra/postgres/tables/',
  out: './src/infra/postgres/migrations/',
  driver: 'pg',
  dbCredentials: {
    connectionString: `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`,
  },
  verbose: true,
  strict: true,
});
