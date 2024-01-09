import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RejectedTradeEntity, RejectedTradeModel, CreateRejectedTradeEntityFields } from 'src/infra/postgres/entities/rejected-trade.entity';
import { TradeStatus } from 'src/infra/postgres/entities/trade.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RejectedTradesService {
  public constructor(
    @InjectRepository(RejectedTradeEntity)
    private readonly rejectedTradesRepository: Repository<RejectedTradeEntity>,
  ) {}

  public async createOne(
    fields: CreateRejectedTradeEntityFields
  ): Promise<RejectedTradeModel<{
      sender: true,
      senderInventoryEntries: { pokemon: true },
      receiver: true,
      receiverInventoryEntries: { pokemon: true },
  }>> {
    const rejectedTrade = this.rejectedTradesRepository.create({
      ...fields,
      status: TradeStatus.REJECTED,
      rejectedAt: new Date(),
    });

    return this.rejectedTradesRepository.save(rejectedTrade);
  }
}
