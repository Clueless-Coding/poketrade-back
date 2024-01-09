import { Module } from '@nestjs/common';
import { TradesService } from 'src/core/services/trades.service';
import { TradesUseCase } from 'src/core/use-cases/trades.use-case';
import { TradeEntity } from '../postgres/entities/trade.entity';
import { PostgresModule } from '../postgres/postgres.module';
import { UsersModule } from './users.module';
import { UserInventoryEntriesModule } from './user-inventory-entries.module';

@Module({
  imports: [
    PostgresModule.forFeature([TradeEntity]),
    UsersModule,
    UserInventoryEntriesModule,
  ],
  providers: [TradesUseCase, TradesService],
  exports: [TradesUseCase, TradesService],
})
export class TradesModule {}
