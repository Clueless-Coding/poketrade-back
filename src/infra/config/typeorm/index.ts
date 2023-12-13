import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { EnvVariables } from '../validation';
import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

function getFromEnv<T extends keyof EnvVariables>(
  variableName: T,
  defaultValue: EnvVariables[T],
  configService?: ConfigService<EnvVariables>,
): EnvVariables[T] {
  return configService
    ? configService.get(variableName, defaultValue)
    : (process.env[variableName] as EnvVariables[T]) ?? defaultValue;
}

const getDataSourceOptions = (configService?: ConfigService<EnvVariables>): DataSourceOptions => {
  return {
    type: 'postgres',
    host: getFromEnv('DATABASE_HOST', '127.0.0.1', configService),
    port: getFromEnv('DATABASE_PORT', 5432, configService),
    username: getFromEnv('DATABASE_USER', 'postgres', configService),
    password: getFromEnv('DATABASE_PASSWORD', 'postgres', configService),
    database: getFromEnv('DATABASE_NAME', 'poketrade', configService),

    entities: ['dist/infra/postgres/entities/*.js'],
    migrations: ['dist/infra/postgres/migrations/*.js'],

    synchronize: false,
    namingStrategy: new SnakeNamingStrategy(),
  };
};

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  public constructor(private readonly configService: ConfigService<EnvVariables>) {}

  public createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      ...getDataSourceOptions(this.configService),
      autoLoadEntities: true,
    };
  }
}

dotenv.config();
export default new DataSource(getDataSourceOptions());

