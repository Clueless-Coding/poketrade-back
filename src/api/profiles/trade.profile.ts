import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { AcceptedTradeEntity } from 'src/infra/postgres/entities/accepted-trade.entity';
import { CancelledTradeEntity } from 'src/infra/postgres/entities/cancelled-trade.entity';
import { PendingTradeEntity } from 'src/infra/postgres/entities/pending-trade.entity';
import { RejectedTradeEntity } from 'src/infra/postgres/entities/rejected-trade.entity';
import { AcceptedTradeOutputDTO } from '../dtos/accepted-trades/accepted-trade.output.dto';
import { CancelledTradeOuputDTO } from '../dtos/cancelled-trades/cancelled-trade.output.dto';
import { PendingTradeOutputDTO } from '../dtos/pending-trades/pending-trade.output.dto';
import { RejectedTradeOutputDTO } from '../dtos/rejected-trades/rejected-trade.output.dto';

@Injectable()
export class TradeProfile extends AutomapperProfile {
  public constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  public override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, PendingTradeEntity, PendingTradeOutputDTO);
      createMap(mapper, AcceptedTradeEntity, AcceptedTradeOutputDTO);
      createMap(mapper, CancelledTradeEntity, CancelledTradeOuputDTO);
      createMap(mapper, RejectedTradeEntity, RejectedTradeOutputDTO);
    };
  }
}
