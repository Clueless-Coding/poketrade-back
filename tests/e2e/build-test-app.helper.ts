import { DrizzlePGModule } from '@knaadh/nestjs-drizzle-pg';
import { Database } from 'src/infra/postgres/other/types';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PostgresModule } from 'src/infra/postgres/postgres.module';
import { INestApplication, Module, ValidationPipe } from '@nestjs/common';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { DRIZZLE_DB_TAG } from 'src/infra/consts';
import * as tables from 'src/infra/postgres/tables';

export const buildTestApp = async (): Promise<INestApplication> => {
  const postgresContainer = new PostgreSqlContainer()
  const startedPostgresContainer = await postgresContainer.start();

  @Module({
    imports: [
      DrizzlePGModule.register({
        tag: DRIZZLE_DB_TAG,
        pg: {
          connection: 'client',
          config: {
            connectionString: startedPostgresContainer.getConnectionUri(),
          }
        },
        config: {
          schema: tables,
        },
      })
    ]
  })
  class TestPostgresModule {}

  const moduleFixture = await Test
    .createTestingModule({
      imports: [AppModule],
    })
    .overrideModule(PostgresModule)
    .useModule(TestPostgresModule)
    .compile();

  await migrate(
    moduleFixture.get<Database>(DRIZZLE_DB_TAG),
    { migrationsFolder: 'src/infra/postgres/migrations' },
  );
  // TODO: Run pokemon seeder

  const app = moduleFixture.createNestApplication();

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  await app.init();

  return app;
}
