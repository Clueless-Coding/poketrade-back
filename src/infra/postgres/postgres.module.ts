import { DynamicModule, Inject, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvVariables } from '../config/validation';
import { TypeOrmConfigService } from '../config/typeorm';
import { ConfigModule } from "@nestjs/config";
import { validate } from '../config/validation';
import { DrizzlePGModule } from '@knaadh/nestjs-drizzle-pg';
import * as schema from './tables';

// TODO: move to separate file
const DRIZZLE_DB_TAG = 'DRIZZLE_DB_TAG';
export const InjectDrizzle = () => Inject(DRIZZLE_DB_TAG);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService<EnvVariables>],
      useClass: TypeOrmConfigService,
    }),
    DrizzlePGModule.registerAsync({
      tag: DRIZZLE_DB_TAG,
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
          schema,
        },
      })
    })
  ],
})
export class PostgresModule {
  public static forFeature(...args: Parameters<typeof TypeOrmModule.forFeature>): DynamicModule {
    return {
      ...TypeOrmModule.forFeature(...args),
      module: PostgresModule,
    };
  }
}
