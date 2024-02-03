import { Injectable } from '@nestjs/common';
import { TradesRepository } from '../repositories/trades.repository';

@Injectable()
export class TradesService {
  public constructor(
    private readonly tradesRepository: TradesRepository,
  ) {}
}
