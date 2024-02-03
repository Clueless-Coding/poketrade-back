import { Module } from '@nestjs/common';
import { UserRefreshTokensRepository } from 'src/core/repositories/user-refresh-tokens.repository';
import { PostgresModule } from '../../postgres/postgres.module';

@Module({
  providers: [
    PostgresModule,
    UserRefreshTokensRepository,
  ],
  exports: [UserRefreshTokensRepository],
})
export class UserRefreshTokensModule {}
