import { Injectable } from '@nestjs/common';
import { TradesRepository } from '../repositories/trades.repository';

@Injectable()
export class TradesUseCase {
  public constructor(
    private readonly tradesRepository: TradesRepository,
  ) {}
}
