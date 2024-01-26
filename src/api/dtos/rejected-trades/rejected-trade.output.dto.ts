import { ApiProperty, OmitType } from '@nestjs/swagger';
import { TradeOutputDTO } from '../trades/trade.output.dto';

export class RejectedTradeOutputDTO extends OmitType(TradeOutputDTO, [
  'status',
]) {
  @ApiProperty()
  status: 'REJECTED';
}
