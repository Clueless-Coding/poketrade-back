import { ApiProperty, OmitType } from '@nestjs/swagger';
import { TradeOutputDTO } from '../trades/trade.output.dto';
import { AutoMap } from '@automapper/classes';
import { TradeStatus } from 'src/core/entities/trade.entity';

export class RejectedTradeOutputDTO extends OmitType(TradeOutputDTO, [
  'status',
]) {
  @ApiProperty({ enum: [TradeStatus.REJECTED] })
  @AutoMap()
  status: TradeStatus.REJECTED;
}
