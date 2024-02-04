import { Module } from '@nestjs/common';
import { ITradesRepository } from 'src/core/repositories/trades.repository';
import { TradesService } from 'src/core/services/trades.service';
import { PostgresModule } from '../../postgres/postgres.module';
import { UsersModule } from './users.module';
import { UserItemsModule } from './user-items.module';
import { PendingTradesService } from 'src/core/services/pending-trades.service';
import { ITradesToUserItemsRepository } from 'src/core/repositories/trades-to-user-items.repository';
import { TradesRepository } from 'src/infra/postgres/repositories/trades.repository';
import { TradesToUserItemsRepository } from 'src/infra/postgres/repositories/trades-to-user-items.repository';

@Module({
  imports: [
    PostgresModule,
    UsersModule,
    UserItemsModule,
  ],
  providers: [
    TradesService,
    PendingTradesService,
    {
      provide: ITradesRepository,
      useClass: TradesRepository,
    },
    {
      provide: ITradesToUserItemsRepository,
      useClass: TradesToUserItemsRepository,
    },
  ],
  exports: [
    TradesService,
    PendingTradesService,
    ITradesRepository,
    ITradesToUserItemsRepository,
  ],
})
export class TradesModule {}
