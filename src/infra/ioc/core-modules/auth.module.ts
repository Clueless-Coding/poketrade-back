import { Module } from '@nestjs/common';
import { PostgresModule } from '../../postgres/postgres.module';
import { AuthUseCase } from 'src/core/use-cases/auth.use-case';
import { UsersModule } from './users.module';
import { UserRefreshTokensModule } from './user-refresh-tokens.module';

@Module({
  imports: [PostgresModule, UsersModule, UserRefreshTokensModule],
  providers: [AuthUseCase],
  exports: [AuthUseCase],
})
export class AuthModule {}
