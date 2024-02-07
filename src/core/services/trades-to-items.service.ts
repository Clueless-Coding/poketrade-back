import { Injectable } from '@nestjs/common';
import { ITradesToItemsRepository } from '../repositories/trades-to-items.repository';
import { PaginatedArray, UUIDv4 } from 'src/common/types';
import { PaginationOptionsInputDTO } from 'src/api/dtos/pagination.input.dto';
import { TradeToReceiverItemEntity, TradeToSenderItemEntity } from '../entities/trade-to-item.entity';

@Injectable()
export class TradesToItemsService {
  public constructor(
    private readonly tradesToItemsRepository: ITradesToItemsRepository,
  ) {}

  public async getTradesToSenderItemsWithPaginationByTradeId(
    tradeId: UUIDv4,
    paginationOptionsDTO: PaginationOptionsInputDTO,
  ): Promise<PaginatedArray<TradeToSenderItemEntity>> {
    return this.tradesToItemsRepository.findTradesToSenderItemsWithPagination({
      where: { tradeId },
      paginationOptions: paginationOptionsDTO,
    })
  }

  public async getTradesToReceiverItemsWithPaginationByTradeId(
    tradeId: UUIDv4,
    paginationOptionsDTO: PaginationOptionsInputDTO,
  ): Promise<PaginatedArray<TradeToReceiverItemEntity>> {
    return this.tradesToItemsRepository.findTradesToReceiverItemsWithPagination({
      where: { tradeId },
      paginationOptions: paginationOptionsDTO,
    })
  }
}
