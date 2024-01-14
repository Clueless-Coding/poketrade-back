import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PendingEntityFindRelationsOptionsFromCreateFields } from 'src/infra/postgres/entities/pending-trade.entity';
import { RejectedTradeEntity, RejectedTradeModel, CreateRejectedTradeEntityFields } from 'src/infra/postgres/entities/rejected-trade.entity';
import { TradeStatus } from 'src/infra/postgres/entities/trade.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RejectedTradesService {
  public constructor(
    @InjectRepository(RejectedTradeEntity)
    private readonly rejectedTradesRepository: Repository<RejectedTradeEntity>,
  ) {}

  public async createOne<
    T extends CreateRejectedTradeEntityFields,
  >(
    fields: T,
  ): Promise<RejectedTradeModel<PendingEntityFindRelationsOptionsFromCreateFields<T>>> {
    const rejectedTrade = this.rejectedTradesRepository.create({
      ...fields,
      status: TradeStatus.REJECTED,
      rejectedAt: new Date(),
    });

    return this.rejectedTradesRepository.save(
      rejectedTrade
    ) as unknown as Promise<RejectedTradeModel<PendingEntityFindRelationsOptionsFromCreateFields<T>>>;
  }
}
