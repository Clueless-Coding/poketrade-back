import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CancelledTradeEntity, CancelledTradeModel, CreateCancelledTradeEntityFields } from 'src/infra/postgres/entities/cancelled-trade.entity';
import { TradeStatus } from 'src/infra/postgres/entities/trade.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CancelledTradesService {
  public constructor(
    @InjectRepository(CancelledTradeEntity)
    private readonly cancelledTradesRepository: Repository<CancelledTradeEntity>,
  ) {}

  public async createOne(
    fields: CreateCancelledTradeEntityFields
  ): Promise<CancelledTradeModel<{
      sender: true,
      senderInventoryEntries: { pokemon: true },
      receiver: true,
      receiverInventoryEntries: { pokemon: true },
  }>> {
    const cancelledTrade = this.cancelledTradesRepository.create({
      ...fields,
      status: TradeStatus.CANCELLED,
      cancelledAt: new Date(),
    });

    return this.cancelledTradesRepository.save(cancelledTrade);
  }
}
