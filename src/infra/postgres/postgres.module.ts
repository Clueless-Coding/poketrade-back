import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvVariables } from '../config/validation';
import { TypeOrmConfigService } from '../config/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService<EnvVariables>],
      useClass: TypeOrmConfigService,
    }),
  ],
})
export class PostgresModule {}
