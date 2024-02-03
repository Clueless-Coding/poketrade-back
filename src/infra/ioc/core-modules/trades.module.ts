import { Module } from '@nestjs/common';
import { TradesRepository } from 'src/core/repositories/trades.repository';
import { TradesUseCase } from 'src/core/use-cases/trades.use-case';
import { PostgresModule } from '../../postgres/postgres.module';
import { UsersModule } from './users.module';
import { UserItemsModule } from './user-items.module';
import { PendingTradesUseCase } from 'src/core/use-cases/pending-trades.use-case';
import { TradesToUserItemsRepository } from 'src/core/repositories/trades-to-user-items.repository';

@Module({
  imports: [
    PostgresModule,
    UsersModule,
    UserItemsModule,
  ],
  providers: [
    TradesUseCase,
    TradesRepository,
    TradesToUserItemsRepository,
    PendingTradesUseCase,
  ],
  exports: [
    TradesUseCase,
    TradesRepository,
    TradesToUserItemsRepository,
    PendingTradesUseCase,
  ],
})
export class TradesModule {}
