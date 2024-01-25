import { Injectable } from '@nestjs/common';
import { TradesService } from '../services/trades.service';

@Injectable()
export class TradesUseCase {
  public constructor(
    private readonly tradesService: TradesService,
  ) {}
}
