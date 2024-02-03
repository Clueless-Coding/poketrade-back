import { Module } from '@nestjs/common';
import { TradesService } from 'src/core/services/trades.service';
import { TradesUseCase } from 'src/core/use-cases/trades.use-case';
import { PostgresModule } from '../../postgres/postgres.module';
import { UsersModule } from './users.module';
import { UserItemsModule } from './user-items.module';
import { PendingTradesUseCase } from 'src/core/use-cases/pending-trades.use-case';
import { TradesToUserItemsService } from 'src/core/services/trades-to-user-items.service';

@Module({
  imports: [
    PostgresModule,
    UsersModule,
    UserItemsModule,
  ],
  providers: [
    TradesUseCase,
    TradesService,
    TradesToUserItemsService,
    PendingTradesUseCase,
  ],
  exports: [
    TradesUseCase,
    TradesService,
    TradesToUserItemsService,
    PendingTradesUseCase,
  ],
})
export class TradesModule {}
