import { Module } from '@nestjs/common';
import { PostgresModule } from '../../postgres/postgres.module';
import { AuthService } from 'src/core/services/auth.service';
import { UsersModule } from './users.module';
import { UserRefreshTokensModule } from './user-refresh-tokens.module';

@Module({
  imports: [PostgresModule, UsersModule, UserRefreshTokensModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
