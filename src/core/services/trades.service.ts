import { Injectable } from '@nestjs/common';
import { ITradesRepository } from '../repositories/trades.repository';
import { PaginationOptionsInputDTO } from 'src/api/dtos/pagination.input.dto';
import { PaginatedArray, UUIDv4 } from 'src/common/types';
import { TradeEntity } from '../entities/trade.entity';

@Injectable()
export class TradesService {
  public constructor(
    private readonly tradesRepository: ITradesRepository,
  ) {}

  public async getTradeById(id: UUIDv4) {
    return this.tradesRepository.findTradeById({ id });
  }

  public async getTradesWithPagination(
    paginationOptionsDTO: PaginationOptionsInputDTO,
  ): Promise<PaginatedArray<TradeEntity>> {
    return this.tradesRepository.findTradesWithPagination({
      paginationOptions: paginationOptionsDTO,
    });
  }
}
