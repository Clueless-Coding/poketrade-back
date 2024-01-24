import { ApiProperty, OmitType } from '@nestjs/swagger';
import { TradeOutputDTO } from '../trades/trade.output.dto';

export class CancelledTradeOuputDTO extends OmitType(TradeOutputDTO, [
  'status',
  'cancelledAt',
  'acceptedAt',
  'rejectedAt',
]) {
  @ApiProperty()
  status: 'CANCELLED';

  @ApiProperty()
  cancelledAt: Date;
}
