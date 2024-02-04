import { Module } from '@nestjs/common';
import { IUserRefreshTokensRepository } from 'src/core/repositories/user-refresh-tokens.repository';
import { PostgresModule } from '../../postgres/postgres.module';
import { UserRefreshTokensRepository } from 'src/infra/postgres/repositories/user-refresh-tokens.repository';

@Module({
  providers: [
    PostgresModule,
    {
      provide: IUserRefreshTokensRepository,
      useClass: UserRefreshTokensRepository,
    }
  ],
  exports: [IUserRefreshTokensRepository],
})
export class UserRefreshTokensModule {}
