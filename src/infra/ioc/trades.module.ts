import { Module } from '@nestjs/common';
import { TradesService } from 'src/core/services/trades.service';
import { TradesUseCase } from 'src/core/use-cases/trades.use-case';
import { PostgresModule } from '../postgres/postgres.module';
import { UsersModule } from './users.module';
import { UserItemsModule } from './user-items.module';
import { PendingTradesUseCase } from 'src/core/use-cases/pending-trades.use-case';
import { TradesToSenderItemsService } from 'src/core/services/trades-to-sender-items.service';
import { TradesToReceiverItemsService } from 'src/core/services/trades-to-receiver-items.service';

@Module({
  imports: [
    PostgresModule,
    UsersModule,
    UserItemsModule,
  ],
  providers: [
    TradesUseCase,
    TradesService,
    TradesToSenderItemsService,
    TradesToReceiverItemsService,
    PendingTradesUseCase,
  ],
  exports: [
    TradesUseCase,
    TradesService,
    TradesToSenderItemsService,
    TradesToReceiverItemsService,
    PendingTradesUseCase,
  ],
})
export class TradesModule {}
