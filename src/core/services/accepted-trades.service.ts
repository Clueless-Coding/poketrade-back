import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AcceptedTradeEntity, AcceptedTradeModel, CreateAcceptedTradeEntityFields } from 'src/infra/postgres/entities/accepted-trade.entity';
import { PendingEntityFindRelationsOptionsFromCreateFields } from 'src/infra/postgres/entities/pending-trade.entity';
import { TradeStatus } from 'src/infra/postgres/entities/trade.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AcceptedTradesService {
  public constructor(
    @InjectRepository(AcceptedTradeEntity)
    private readonly acceptedTradesRepository: Repository<AcceptedTradeEntity>,
  ) {}

  public async createOne<
    T extends CreateAcceptedTradeEntityFields,
  >(
    fields: T,
  ): Promise<AcceptedTradeModel<PendingEntityFindRelationsOptionsFromCreateFields<T>>> {
    const acceptedTrade = this.acceptedTradesRepository.create({
      ...fields,
      status: TradeStatus.ACCEPTED,
      acceptedAt: new Date(),
    });

    return this.acceptedTradesRepository.save(
      acceptedTrade
    ) as unknown as Promise<AcceptedTradeModel<PendingEntityFindRelationsOptionsFromCreateFields<T>>>;
  }
}
