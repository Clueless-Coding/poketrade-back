import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AcceptedTradeEntity, AcceptedTradeModel, CreateAcceptedTradeEntityFields } from 'src/infra/postgres/entities/accepted-trade.entity';
import { TradeStatus } from 'src/infra/postgres/entities/trade.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AcceptedTradesService {
  public constructor(
    @InjectRepository(AcceptedTradeEntity)
    private readonly acceptedTradesRepository: Repository<AcceptedTradeEntity>,
  ) {}

  public async createOne(
    fields: CreateAcceptedTradeEntityFields
  ): Promise<AcceptedTradeModel<{
      sender: true,
      senderInventoryEntries: { pokemon: true },
      receiver: true,
      receiverInventoryEntries: { pokemon: true },
  }>> {
    const acceptedTrade = this.acceptedTradesRepository.create({
      ...fields,
      status: TradeStatus.ACCEPTED,
    });

    return this.acceptedTradesRepository.save(acceptedTrade);
  }
}
