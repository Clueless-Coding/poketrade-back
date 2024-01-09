import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { AcceptedTradeEntity } from 'src/infra/postgres/entities/accepted-trade.entity';
import { PendingTradeEntity } from 'src/infra/postgres/entities/pending-trade.entity';
import { AcceptedTradeOutputDTO } from '../dtos/accepted-trades/accepted-trade.output.dto';
import { PendingTradeOutputDTO } from '../dtos/pending-trades/pending-trade.output.dto';

@Injectable()
export class TradeProfile extends AutomapperProfile {
  public constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  public override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, PendingTradeEntity, PendingTradeOutputDTO);
      createMap(mapper, AcceptedTradeEntity, AcceptedTradeOutputDTO);
    };
  }
}
