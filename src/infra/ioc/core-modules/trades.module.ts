import { Module } from '@nestjs/common';
import { TradesRepository } from 'src/core/repositories/trades.repository';
import { TradesService } from 'src/core/services/trades.service';
import { PostgresModule } from '../../postgres/postgres.module';
import { UsersModule } from './users.module';
import { UserItemsModule } from './user-items.module';
import { PendingTradesService } from 'src/core/services/pending-trades.service';
import { TradesToUserItemsRepository } from 'src/core/repositories/trades-to-user-items.repository';

@Module({
  imports: [
    PostgresModule,
    UsersModule,
    UserItemsModule,
  ],
  providers: [
    TradesService,
    TradesRepository,
    TradesToUserItemsRepository,
    PendingTradesService,
  ],
  exports: [
    TradesService,
    TradesRepository,
    TradesToUserItemsRepository,
    PendingTradesService,
  ],
})
export class TradesModule {}
