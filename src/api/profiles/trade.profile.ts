import { createMap, forMember, mapFrom, Mapper, MappingProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { PojoMetadata, PojosMetadataMap } from '@automapper/pojos';
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
import { UserItemOutputDTO } from '../dtos/user-items/user-item.output.dto';

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
      cancelledAt: Date,
      acceptedAt: Date,
      rejectedAt: Date,
      sender: 'UserEntity',
      receiver: 'UserEntity',
    };
    PojosMetadataMap.create<TradeEntity>('TradeEntity', tradeEntityProperties);

    let cancelledAt, acceptedAt, rejectedAt;
    let pendingTradeEntityProperties, cancelledTradeEntityProperties, acceptedTradeEntityProperties, rejectedTradeEntityProperties;
    ({ cancelledAt, acceptedAt, rejectedAt, ...pendingTradeEntityProperties } = tradeEntityProperties);
    PojosMetadataMap.create<PendingTradeEntity>('PendingTradeEntity', pendingTradeEntityProperties);

    ({ acceptedAt, rejectedAt, ...cancelledTradeEntityProperties } = tradeEntityProperties);
    PojosMetadataMap.create<CancelledTradeEntity>('CancelledTradeEntity', cancelledTradeEntityProperties);

    ({ cancelledAt, rejectedAt, ...acceptedTradeEntityProperties } = tradeEntityProperties);
    PojosMetadataMap.create<AcceptedTradeEntity>('AcceptedTradeEntity', acceptedTradeEntityProperties);

    ({ cancelledAt, acceptedAt, ...rejectedTradeEntityProperties } = tradeEntityProperties);
    PojosMetadataMap.create<RejectedTradeEntity>('RejectedTradeEntity', rejectedTradeEntityProperties);
  }

  private createMetadataDTOs(): void {
    const tradeOutputDTOProperties = {
      id: String,
      createdAt: Date,
      updatedAt: Date,
      status: String,
      cancelledAt: Date,
      acceptedAt: Date,
      rejectedAt: Date,
      sender: 'UserOutputDTO',
      receiver: 'UserOutputDTO',
    };
    PojosMetadataMap.create<TradeOutputDTO>('TradeOutputDTO', tradeOutputDTOProperties);

    let cancelledAt, acceptedAt, rejectedAt;
    let pendingTradeOutputDTOProperties, cancelledTradeOutputDTOProperties, acceptedTradeOutputDTOProperties, rejectedTradeOutputDTOProperties;
    ({ cancelledAt, acceptedAt, rejectedAt, ...pendingTradeOutputDTOProperties } = tradeOutputDTOProperties);
    PojosMetadataMap.create<PendingTradeOutputDTO>('PendingTradeOutputDTO', pendingTradeOutputDTOProperties);

    ({ acceptedAt, rejectedAt, ...cancelledTradeOutputDTOProperties } = tradeOutputDTOProperties);
    PojosMetadataMap.create<CancelledTradeOuputDTO>('CancelledTradeOutputDTO', cancelledTradeOutputDTOProperties);

    ({ cancelledAt, rejectedAt, ...acceptedTradeOutputDTOProperties } = tradeOutputDTOProperties);
    PojosMetadataMap.create<AcceptedTradeOutputDTO>('AcceptedTradeOutputDTO', acceptedTradeOutputDTOProperties);

    ({ cancelledAt, acceptedAt, ...rejectedTradeOutputDTOProperties } = tradeOutputDTOProperties);
    PojosMetadataMap.create<RejectedTradeOutputDTO>('RejectedTradeOutputDTO', rejectedTradeOutputDTOProperties);
  }
}
