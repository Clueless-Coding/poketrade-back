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

@Module({
  imports: [
    PostgresModule.forFeature([TradeEntity, PendingTradeEntity, AcceptedTradeEntity]),
    UsersModule,
    UserInventoryEntriesModule,
  ],
  providers: [
    TradesUseCase,
    TradesService,
    PendingTradesUseCase,
    PendingTradesService,
    AcceptedTradesService,
  ],
  exports: [
    TradesUseCase,
    TradesService,
    PendingTradesUseCase,
    PendingTradesService,
    AcceptedTradesService,
  ],
})
export class TradesModule {}
