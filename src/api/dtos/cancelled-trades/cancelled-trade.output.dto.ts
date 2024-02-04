import { ApiProperty, OmitType } from '@nestjs/swagger';
import { TradeOutputDTO } from '../trades/trade.output.dto';
import { AutoMap } from '@automapper/classes';

export class CancelledTradeOuputDTO extends OmitType(TradeOutputDTO, [
  'status',
]) {
  @ApiProperty()
  @AutoMap()
  status: 'CANCELLED';
}
