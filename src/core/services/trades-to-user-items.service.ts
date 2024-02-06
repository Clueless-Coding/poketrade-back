import { Injectable } from '@nestjs/common';
import { ITradesToUserItemsRepository } from '../repositories/trades-to-user-items.repository';
import { PaginatedArray, UUIDv4 } from 'src/common/types';
import { PaginationOptionsInputDTO } from 'src/api/dtos/pagination.input.dto';
import { TradeToReceiverItemEntity, TradeToSenderItemEntity } from '../entities/trade-to-user-item.entity';

@Injectable()
export class TradesToUserItemsService {
  public constructor(
    private readonly tradesToUserItemsRepository: ITradesToUserItemsRepository,
  ) {}

  public async getTradesToSenderItemsWithPaginationByTradeId(
    tradeId: UUIDv4,
    paginationOptionsDTO: PaginationOptionsInputDTO,
  ): Promise<PaginatedArray<TradeToSenderItemEntity>> {
    return this.tradesToUserItemsRepository.findTradesToSenderItemsWithPagination({
      where: { tradeId },
      paginationOptions: paginationOptionsDTO,
    })
  }

  public async getTradesToReceiverItemsWithPaginationByTradeId(
    tradeId: UUIDv4,
    paginationOptionsDTO: PaginationOptionsInputDTO,
  ): Promise<PaginatedArray<TradeToReceiverItemEntity>> {
    return this.tradesToUserItemsRepository.findTradesToReceiverItemsWithPagination({
      where: { tradeId },
      paginationOptions: paginationOptionsDTO,
    })
  }
}
