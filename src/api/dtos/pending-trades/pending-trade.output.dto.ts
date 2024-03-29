import { ApiProperty, OmitType } from '@nestjs/swagger';
import { TradeOutputDTO } from '../trades/trade.output.dto';
import { AutoMap } from '@automapper/classes';
import { TradeStatus } from 'src/core/enums/trade-status.enum';

export class PendingTradeOutputDTO extends OmitType(TradeOutputDTO, [
  'status',
]) {
  @ApiProperty({ enum: [TradeStatus.PENDING] })
  @AutoMap()
  status: TradeStatus.PENDING;
}
