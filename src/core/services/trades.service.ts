import { Injectable } from '@nestjs/common';
import { ITradesRepository } from '../repositories/trades.repository';

@Injectable()
export class TradesService {
  public constructor(
    private readonly tradesRepository: ITradesRepository,
  ) {}
}
