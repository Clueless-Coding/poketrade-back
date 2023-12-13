import { Module } from '@nestjs/common';
import { PostgresModule } from '../postgres/postgres.module';
import { AuthUseCase } from 'src/core/use-cases/auth.use-case';
import { UsersModule } from './users.module';

@Module({
  imports: [PostgresModule, UsersModule],
  providers: [AuthUseCase],
  exports: [AuthUseCase],
})
export class AuthModule {}
