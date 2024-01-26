import { ApiProperty, OmitType } from '@nestjs/swagger';
import { TradeOutputDTO } from '../trades/trade.output.dto';

export class PendingTradeOutputDTO extends OmitType(TradeOutputDTO, [
  'status',
]) {
  @ApiProperty()
  status: 'PENDING';
}
