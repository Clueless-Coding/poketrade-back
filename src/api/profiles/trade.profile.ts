import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { TradeEntity } from 'src/infra/postgres/entities/trade.entity';
import { TradeOutputDTO } from '../dtos/trades/trade.output.dto';

@Injectable()
export class TradeProfile extends AutomapperProfile {
  public constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  public override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, TradeEntity, TradeOutputDTO);
    };
  }
}
