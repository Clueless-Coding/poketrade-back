import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvVariables } from '../config/env.config';
import { DrizzlePGModule } from '@knaadh/nestjs-drizzle-pg';
import * as tables from './tables';
import { DRIZZLE_DB_INJECTION_TOKEN } from '../ioc/injection-tokens';

@Module({
  imports: [
    DrizzlePGModule.registerAsync({
      tag: DRIZZLE_DB_INJECTION_TOKEN,
      inject: [ConfigService<EnvVariables>],
      useFactory: (configService: ConfigService<EnvVariables>) => ({
        pg: {
          connection: 'client',
          config: {
            user: configService.getOrThrow('POSTGRES_USER'),
            password: configService.getOrThrow('POSTGRES_PASSWORD'),
            host: configService.getOrThrow('POSTGRES_HOST'),
            database: configService.getOrThrow('POSTGRES_DB'),
            port: configService.getOrThrow('POSTGRES_PORT')
          }
        },
        config: {
          schema: tables,
        },
      })
    })
  ],
})
export class PostgresModule {}
