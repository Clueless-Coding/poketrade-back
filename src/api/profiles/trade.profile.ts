import { createMap, Mapper, MappingProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { PojosMetadataMap } from '@automapper/pojos';
import { Injectable } from '@nestjs/common';
import {
  AcceptedTradeEntity,
  CancelledTradeEntity,
  PendingTradeEntity,
  RejectedTradeEntity,
  TradeEntity,
  TradeToReceiverItemEntity,
  TradeToSenderItemEntity,
} from 'src/infra/postgres/tables';
import { AcceptedTradeOutputDTO } from '../dtos/accepted-trades/accepted-trade.output.dto';
import { CancelledTradeOuputDTO } from '../dtos/cancelled-trades/cancelled-trade.output.dto';
import { PendingTradeOutputDTO } from '../dtos/pending-trades/pending-trade.output.dto';
import { RejectedTradeOutputDTO } from '../dtos/rejected-trades/rejected-trade.output.dto';
import { TradeOutputDTO } from '../dtos/trades/trade.output.dto';

@Injectable()
export class TradeProfile extends AutomapperProfile {
  public constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
    this.createMetadataEntities();
    this.createMetadataDTOs();
  }

  public override get profile(): MappingProfile {
    return (mapper: Mapper) => {
      createMap<TradeEntity, TradeOutputDTO>(
        mapper,
        'TradeEntity',
        'TradeOutputDTO',
      );
      createMap<PendingTradeEntity, PendingTradeOutputDTO>(
        mapper,
        'PendingTradeEntity',
        'PendingTradeOutputDTO',
      );
      createMap<CancelledTradeEntity, CancelledTradeOuputDTO>(
        mapper,
        'CancelledTradeEntity',
        'CancelledTradeOuputDTO',
      );
      createMap<AcceptedTradeEntity, AcceptedTradeOutputDTO>(
        mapper,
        'AcceptedTradeEntity',
        'AcceptedTradeOutputDTO',
      );
      createMap<RejectedTradeEntity, RejectedTradeOutputDTO>(
        mapper,
        'RejectedTradeEntity',
        'RejectedTradeOutputDTO',
      );
    };
  }

  private createMetadataEntities(): void {
    PojosMetadataMap.create<TradeToSenderItemEntity>('TradeToSenderItemEntity', {
      trade: 'TradeEntity',
      senderItem: 'UserItemEntity',
    });

    PojosMetadataMap.create<TradeToReceiverItemEntity>('TradeToReceiverItemEntity', {
      trade: 'TradeEntity',
      receiverItem: 'UserItemEntity',
    });

    const tradeEntityProperties = {
      id: String,
      createdAt: Date,
      updatedAt: Date,
      status: String,
      statusedAt: Date,
      sender: 'UserEntity',
      receiver: 'UserEntity',
    };
    PojosMetadataMap.create<TradeEntity>('TradeEntity', tradeEntityProperties);

    PojosMetadataMap.create<PendingTradeEntity>('PendingTradeEntity', tradeEntityProperties);
    PojosMetadataMap.create<CancelledTradeEntity>('CancelledTradeEntity', tradeEntityProperties);
    PojosMetadataMap.create<AcceptedTradeEntity>('AcceptedTradeEntity', tradeEntityProperties);
    PojosMetadataMap.create<RejectedTradeEntity>('RejectedTradeEntity', tradeEntityProperties);
  }

  private createMetadataDTOs(): void {
    const tradeOutputDTOProperties = {
      id: String,
      createdAt: Date,
      updatedAt: Date,
      status: String,
      statusedAt: Date,
      sender: 'UserOutputDTO',
      receiver: 'UserOutputDTO',
    };
    PojosMetadataMap.create<TradeOutputDTO>('TradeOutputDTO', tradeOutputDTOProperties);

    PojosMetadataMap.create<PendingTradeOutputDTO>('PendingTradeOutputDTO', tradeOutputDTOProperties);
    PojosMetadataMap.create<CancelledTradeOuputDTO>('CancelledTradeOutputDTO', tradeOutputDTOProperties);
    PojosMetadataMap.create<AcceptedTradeOutputDTO>('AcceptedTradeOutputDTO', tradeOutputDTOProperties);
    PojosMetadataMap.create<RejectedTradeOutputDTO>('RejectedTradeOutputDTO', tradeOutputDTOProperties);
  }
}
