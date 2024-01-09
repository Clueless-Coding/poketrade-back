import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { TradeOutputDTO } from '../trades/trade.output.dto';

export class AcceptedTradeOutputDTO extends TradeOutputDTO {
  @ApiProperty()
  @AutoMap()
  acceptedAt: Date;
}
