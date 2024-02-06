import { createMap, forSelf, Mapper, MappingProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import {
  AcceptedTradeEntity,
  CancelledTradeEntity,
  PendingTradeEntity,
  RejectedTradeEntity,
  TradeEntity,
} from 'src/core/entities/trade.entity';
import { AcceptedTradeOutputDTO } from '../dtos/accepted-trades/accepted-trade.output.dto';
import { CancelledTradeOuputDTO } from '../dtos/cancelled-trades/cancelled-trade.output.dto';
import { PendingTradeOutputDTO } from '../dtos/pending-trades/pending-trade.output.dto';
import { RejectedTradeOutputDTO } from '../dtos/rejected-trades/rejected-trade.output.dto';
import { TradeOutputDTO } from '../dtos/trades/trade.output.dto';
import { TradeToReceiverItemEntity, TradeToSenderItemEntity } from 'src/core/entities/trade-to-user-item.entity';
import { UserItemEntity } from 'src/core/entities/user-item.entity';
import { UserItemOutputDTO } from '../dtos/user-items/user-item.output.dto';

@Injectable()
export class TradeProfile extends AutomapperProfile {
  public constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  public override get profile(): MappingProfile {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        TradeEntity,
        TradeOutputDTO,
      );
      createMap(
        mapper,
        PendingTradeEntity,
        PendingTradeOutputDTO,
      );
      createMap(
        mapper,
        CancelledTradeEntity,
        CancelledTradeOuputDTO,
      );
      createMap(
        mapper,
        AcceptedTradeEntity,
        AcceptedTradeOutputDTO,
      );
      createMap(
        mapper,
        RejectedTradeEntity,
        RejectedTradeOutputDTO,
      );
      createMap(
        mapper,
        TradeToSenderItemEntity,
        UserItemOutputDTO,
        forSelf(UserItemOutputDTO, (source) => source.senderItem),
      );
      createMap(
        mapper,
        TradeToReceiverItemEntity,
        UserItemOutputDTO,
        forSelf(UserItemOutputDTO, (source) => source.receiverItem),
      )
    };
  }
}
