import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { TradeOutputDTO } from '../trades/trade.output.dto';

export class CancelledTradeOuputDTO extends TradeOutputDTO {
  @ApiProperty()
  @AutoMap()
  cancelledAt: Date;
}
