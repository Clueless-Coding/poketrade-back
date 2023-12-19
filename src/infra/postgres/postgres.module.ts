import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvVariables } from '../config/validation';
import { TypeOrmConfigService } from '../config/typeorm';
import { ConfigModule } from "@nestjs/config";
import { validate } from '../config/validation';

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
  ],
})
export class PostgresModule {
  public static forFeature = TypeOrmModule.forFeature;
}
