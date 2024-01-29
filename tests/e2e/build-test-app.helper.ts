import { Database } from 'src/infra/postgres/other/types';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { DRIZZLE_DB_TAG } from 'src/infra/consts';
import { join } from 'node:path';
import { ConfigModule } from '@nestjs/config';
import { ApiModule } from 'src/api/api.module';

export const buildTestApp = async (): Promise<INestApplication> => {
  const postgresContainer = new PostgreSqlContainer()
  const startedPostgresContainer = await postgresContainer.start();

  const moduleFixture = await Test
    .createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
          load: [() => ({
            JWT_SECRET: 'test',
            JWT_EXPIRES_IN: '24h',
            POSTGRES_USER: startedPostgresContainer.getUsername(),
            POSTGRES_PASSWORD: startedPostgresContainer.getPassword(),
            POSTGRES_HOST: startedPostgresContainer.getHost(),
            POSTGRES_DB: startedPostgresContainer.getDatabase(),
            POSTGRES_PORT: startedPostgresContainer.getPort(),
          })],
        }),
        ApiModule,
      ],
    })
    .compile();

  await migrate(
    moduleFixture.get<Database>(DRIZZLE_DB_TAG),
    { migrationsFolder: join('src', 'infra', 'postgres', 'migrations') },
  );
  // TODO: Run pokemon seeder

  const app = moduleFixture.createNestApplication();

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  await app.init();

  return app;
}
