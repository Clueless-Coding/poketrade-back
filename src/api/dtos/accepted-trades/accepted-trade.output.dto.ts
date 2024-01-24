import { ApiProperty, OmitType } from '@nestjs/swagger';
import { TradeOutputDTO } from '../trades/trade.output.dto';

export class AcceptedTradeOutputDTO extends OmitType(TradeOutputDTO, [
  'status',
  'cancelledAt',
  'acceptedAt',
  'rejectedAt',
]) {
  @ApiProperty()
  status: 'ACCEPTED';

  @ApiProperty()
  acceptedAt: Date;
}
