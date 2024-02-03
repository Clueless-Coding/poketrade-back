import { Module } from '@nestjs/common';
import { UserRefreshTokensService } from 'src/core/services/user-refresh-tokens.service';
import { PostgresModule } from '../../postgres/postgres.module';

@Module({
  providers: [
    PostgresModule,
    UserRefreshTokensService,
  ],
  exports: [UserRefreshTokensService],
})
export class UserRefreshTokensModule {}
