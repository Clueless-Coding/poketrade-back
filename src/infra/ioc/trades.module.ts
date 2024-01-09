import { Module } from '@nestjs/common';
import { TradesService } from 'src/core/services/trades.service';
import { TradesUseCase } from 'src/core/use-cases/trades.use-case';
import { TradeEntity } from '../postgres/entities/trade.entity';
import { PostgresModule } from '../postgres/postgres.module';
import { UsersModule } from './users.module';
import { UserInventoryEntriesModule } from './user-inventory-entries.module';
import { PendingTradeEntity } from '../postgres/entities/pending-trade.entity';
import { AcceptedTradeEntity } from '../postgres/entities/accepted-trade.entity';
import { PendingTradesUseCase } from 'src/core/use-cases/pending-trades.use-case';
import { PendingTradesService } from 'src/core/services/pending-trades.service';
import { AcceptedTradesService } from 'src/core/services/accepted-trades.service';
import { CancelledTradesService } from 'src/core/services/cancelled-trades.service';
import { CancelledTradeEntity } from '../postgres/entities/cancelled-trade.entity';
import { RejectedTradeEntity } from '../postgres/entities/rejected-trade.entity';
import { RejectedTradesService } from 'src/core/services/rejected-trades.service';

@Module({
  imports: [
    PostgresModule.forFeature([
      TradeEntity,
      PendingTradeEntity,
      AcceptedTradeEntity,
      CancelledTradeEntity,
      RejectedTradeEntity,
    ]),
    UsersModule,
    UserInventoryEntriesModule,
  ],
  providers: [
    TradesUseCase,
    TradesService,
    PendingTradesUseCase,
    PendingTradesService,
    AcceptedTradesService,
    CancelledTradesService,
    RejectedTradesService,
  ],
  exports: [
    TradesUseCase,
    TradesService,
    PendingTradesUseCase,
    PendingTradesService,
    AcceptedTradesService,
    CancelledTradesService,
    RejectedTradesService,
  ],
})
export class TradesModule {}
