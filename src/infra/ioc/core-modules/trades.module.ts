import { Module } from '@nestjs/common';
import { ITradesRepository } from 'src/core/repositories/trades.repository';
import { TradesService } from 'src/core/services/trades.service';
import { PostgresModule } from '../../postgres/postgres.module';
import { UsersModule } from './users.module';
import { UserItemsModule } from './user-items.module';
import { PendingTradesService } from 'src/core/services/pending-trades.service';
import { ITradesToItemsRepository } from 'src/core/repositories/trades-to-items.repository';
import { TradesRepository } from 'src/infra/postgres/repositories/trades.repository';
import { TradesToItemsRepository } from 'src/infra/postgres/repositories/trades-to-items.repository';
import { TradesToItemsService } from 'src/core/services/trades-to-items.service';
import { ItemsModule } from './items.module';

@Module({
  imports: [
    PostgresModule,
    UsersModule,
    UserItemsModule,
    ItemsModule,
  ],
  providers: [
    TradesService,
    PendingTradesService,
    TradesToItemsService,
    {
      provide: ITradesRepository,
      useClass: TradesRepository,
    },
    {
      provide: ITradesToItemsRepository,
      useClass: TradesToItemsRepository,
    },
  ],
  exports: [
    TradesService,
    PendingTradesService,
    TradesToItemsService,
    ITradesRepository,
    ITradesToItemsRepository,
  ],
})
export class TradesModule {}
