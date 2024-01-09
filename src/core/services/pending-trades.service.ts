import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Nullable } from 'src/common/types';
import { AcceptedTradeModel } from 'src/infra/postgres/entities/accepted-trade.entity';
import { CancelledTradeModel } from 'src/infra/postgres/entities/cancelled-trade.entity';
import { CreatePendingTradeEntityFields, PendingTradeEntity, PendingTradeModel } from 'src/infra/postgres/entities/pending-trade.entity';
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

  // TODO: create some kind of a type
  // that converts `CreatePendingTradeEntityFields` to `FindEntityRelationsOptions`
  // and put that inside of PendingTradeModel
  public async createOne(
    fields: CreatePendingTradeEntityFields
  ): Promise<PendingTradeModel<{
    sender: true,
    senderInventoryEntries: { pokemon: true },
    receiver: true,
    receiverInventoryEntries: { pokemon: true },
  }>> {
    const pendingTrade = this.pendingTradesRepository.create({
      ...fields,
      status: TradeStatus.PENDING,
    });

    return this.pendingTradesRepository.save(pendingTrade);
  }

  public async updateToAccepted(
    pendingTrade: PendingTradeModel<{
      sender: true,
      senderInventoryEntries: { pokemon: true },
      receiver: true,
      receiverInventoryEntries: { pokemon: true },
    }>,
  ): Promise<AcceptedTradeModel<{
      sender: true,
      senderInventoryEntries: { pokemon: true },
      receiver: true,
      receiverInventoryEntries: { pokemon: true },
  }>> {
    // TODO: Research more how to easily switch entity from one to another
    // right now this is the only way I could find out
    const pendingTradeId = pendingTrade.id;
    await this.deleteOne(pendingTrade);

    return this.acceptedTradesService.createOne({
        ...pendingTrade,
        id: pendingTradeId,
    });
  }

  public async updateToCancelled(
    pendingTrade: PendingTradeModel<{
      sender: true,
      senderInventoryEntries: { pokemon: true },
      receiver: true,
      receiverInventoryEntries: { pokemon: true },
    }>,
  ): Promise<CancelledTradeModel<{
      sender: true,
      senderInventoryEntries: { pokemon: true },
      receiver: true,
      receiverInventoryEntries: { pokemon: true },
  }>> {
    // TODO: Research more how to easily switch entity from one to another
    // right now this is the only way I could find out
    const pendingTradeId = pendingTrade.id;
    await this.deleteOne(pendingTrade);

    return this.cancelledTradesService.createOne({
        ...pendingTrade,
        id: pendingTradeId,
    });
  }

  public async updateToRejected(
    pendingTrade: PendingTradeModel<{
      sender: true,
      senderInventoryEntries: { pokemon: true },
      receiver: true,
      receiverInventoryEntries: { pokemon: true },
    }>,
  ): Promise<RejectedTradeModel<{
      sender: true,
      senderInventoryEntries: { pokemon: true },
      receiver: true,
      receiverInventoryEntries: { pokemon: true },
  }>> {
    // TODO: Research more how to easily switch entity from one to another
    // right now this is the only way I could find out
    const pendingTradeId = pendingTrade.id;
    await this.deleteOne(pendingTrade);

    return this.rejectedTradesService.createOne({
        ...pendingTrade,
        id: pendingTradeId,
    });
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
