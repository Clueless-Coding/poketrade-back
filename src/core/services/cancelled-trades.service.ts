import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CancelledTradeEntity, CancelledTradeModel, CreateCancelledTradeEntityFields } from 'src/infra/postgres/entities/cancelled-trade.entity';
import { PendingEntityFindRelationsOptionsFromCreateFields } from 'src/infra/postgres/entities/pending-trade.entity';
import { TradeStatus } from 'src/infra/postgres/entities/trade.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CancelledTradesService {
  public constructor(
    @InjectRepository(CancelledTradeEntity)
    private readonly cancelledTradesRepository: Repository<CancelledTradeEntity>,
  ) {}

  public async createOne<
    T extends CreateCancelledTradeEntityFields,
  >(
    fields: T,
  ): Promise<CancelledTradeModel<PendingEntityFindRelationsOptionsFromCreateFields<T>>> {
    const cancelledTrade = this.cancelledTradesRepository.create({
      ...fields,
      status: TradeStatus.CANCELLED,
      cancelledAt: new Date(),
    });

    return this.cancelledTradesRepository.save(
      cancelledTrade
    ) as unknown as Promise<CancelledTradeModel<PendingEntityFindRelationsOptionsFromCreateFields<T>>>;
  }
}
