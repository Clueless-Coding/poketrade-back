import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Nullable } from 'src/common/types';
import { AcceptedTradeModel } from 'src/infra/postgres/entities/accepted-trade.entity';
import { CancelledTradeModel } from 'src/infra/postgres/entities/cancelled-trade.entity';
import { CreatePendingTradeEntityFields, PendingEntityFindRelationsOptionsFromCreateFields, PendingTradeEntity, PendingTradeModel } from 'src/infra/postgres/entities/pending-trade.entity';
import { RejectedTradeModel } from 'src/infra/postgres/entities/rejected-trade.entity';
import { TradeStatus } from 'src/infra/postgres/entities/trade.entity';
import { FindEntityRelationsOptions } from 'src/infra/postgres/other/types';
import { FindOptionsWhere, Repository } from 'typeorm';
import { AcceptedTradesService } from './accepted-trades.service';
import { CancelledTradesService } from './cancelled-trades.service';
import { RejectedTradesService } from './rejected-trades.service';

@Injectable()
export class PendingTradesService {
  public constructor(
    @InjectRepository(PendingTradeEntity)
    private readonly pendingTradesRepository: Repository<PendingTradeEntity>,

    private readonly acceptedTradesService: AcceptedTradesService,
    private readonly cancelledTradesService: CancelledTradesService,
    private readonly rejectedTradesService: RejectedTradesService,
  ) {}

  public async findOne<
    T extends FindEntityRelationsOptions<PendingTradeEntity> = {}
  >(
    where?: FindOptionsWhere<PendingTradeEntity>,
    relations?: T,
  ) {
    return this.pendingTradesRepository.findOne({
      where,
      relations,
    }) as Promise<Nullable<PendingTradeModel<T>>>;
  }

  public async createOne<
    T extends CreatePendingTradeEntityFields,
  >(
    fields: T,
  ): Promise<PendingTradeModel<PendingEntityFindRelationsOptionsFromCreateFields<T>>> {
    const pendingTrade = this.pendingTradesRepository.create({
      ...fields,
      status: TradeStatus.PENDING,
    });

    return this.pendingTradesRepository.save(
      pendingTrade
    ) as unknown as Promise<PendingTradeModel<PendingEntityFindRelationsOptionsFromCreateFields<T>>>;
  }

  public async updateToAccepted<
    T extends Required<FindEntityRelationsOptions<PendingTradeEntity>>,
  >(
    pendingTrade: PendingTradeModel<T>,
  ): Promise<AcceptedTradeModel<T>> {
    // TODO: Research more how to easily switch entity from one to another
    // right now this is the only way I could find out
    const pendingTradeId = pendingTrade.id;
    await this.deleteOne(pendingTrade);

    return this.acceptedTradesService.createOne({
        ...pendingTrade,
        id: pendingTradeId,
    }) as Promise<AcceptedTradeModel<T>>;
  }

  public async updateToCancelled<
    T extends Required<FindEntityRelationsOptions<PendingTradeEntity>>
  >(
    pendingTrade: PendingTradeModel<T>,
  ): Promise<CancelledTradeModel<T>> {
    // TODO: Research more how to easily switch entity from one to another
    // right now this is the only way I could find out
    const pendingTradeId = pendingTrade.id;
    await this.deleteOne(pendingTrade);

    return this.cancelledTradesService.createOne({
        ...pendingTrade,
        id: pendingTradeId,
    }) as Promise<CancelledTradeModel<T>>;
  }

  public async updateToRejected<
    T extends Required<FindEntityRelationsOptions<PendingTradeEntity>>,
  >(
    pendingTrade: PendingTradeModel<T>,
  ): Promise<RejectedTradeModel<T>> {
    // TODO: Research more how to easily switch entity from one to another
    // right now this is the only way I could find out
    const pendingTradeId = pendingTrade.id;
    await this.deleteOne(pendingTrade);

    return this.rejectedTradesService.createOne({
        ...pendingTrade,
        id: pendingTradeId,
    }) as Promise<RejectedTradeModel<T>>;
  }

  public async deleteOne<
    T extends FindEntityRelationsOptions<PendingTradeEntity>,
  >(
    pendingTrade: PendingTradeModel<T>,
  ): Promise<PendingTradeModel<T>> {
    return this.pendingTradesRepository.remove(
      pendingTrade as unknown as PendingTradeEntity,
    ) as unknown as Promise<PendingTradeModel<T>>;
  }
}
