import { Injectable } from '@nestjs/common';
import { PendingTradesService } from '../services/pending-trades.service';
import { TradesService } from '../services/trades.service';
import { UserInventoryEntriesUseCase } from './user-inventory-entries.use-case';
import { UsersUseCase } from './users.use-case';

@Injectable()
export class TradesUseCase {
  public constructor(
    private readonly tradesService: TradesService,
    private readonly pendingTradesService: PendingTradesService,
    private readonly usersUseCase: UsersUseCase,
    private readonly userInventoryEntriesUseCase: UserInventoryEntriesUseCase,
  ) {}
}
