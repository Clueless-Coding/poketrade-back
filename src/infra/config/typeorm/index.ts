import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { EnvVariables } from '../validation';
import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

function getOrThrowFromEnv<T extends keyof EnvVariables>(
  envVariableName: T,
  configService?: ConfigService<EnvVariables>,
): EnvVariables[T] {
  if (configService) {
    return configService.getOrThrow(envVariableName)
  }

  const envVariable = process.env[envVariableName] as EnvVariables[T] | undefined;
  if (!envVariable) {
    throw new TypeError(`Configuration key "${envVariableName}" does not exist`);
  }
  return envVariable;
}

const getDataSourceOptions = (configService?: ConfigService<EnvVariables>): DataSourceOptions => {
  return {
    type: 'postgres',
    host: getOrThrowFromEnv('POSTGRES_HOST', configService),
    port: getOrThrowFromEnv('POSTGRES_PORT', configService),
    username: getOrThrowFromEnv('POSTGRES_USER', configService),
    password: getOrThrowFromEnv('POSTGRES_PASSWORD', configService),
    database: getOrThrowFromEnv('POSTGRES_DB', configService),

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

