import { PendingTradeOutputDTO } from './pending-trade.output.dto';
import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { ItemOutputDTO } from '../items/item.output.dto';

export class CreatePendingTradeOutputDTO {
  @ApiProperty({ type: PendingTradeOutputDTO })
  @AutoMap(() => PendingTradeOutputDTO)
  public readonly pendingTrade: PendingTradeOutputDTO;

  @ApiProperty({ type: ItemOutputDTO, isArray: true })
  @AutoMap(() => [ItemOutputDTO])
  public readonly senderItems: Array<ItemOutputDTO>;

  @ApiProperty({ type: ItemOutputDTO, isArray: true })
  @AutoMap(() => [ItemOutputDTO])
  public readonly receiverItems: Array<ItemOutputDTO>;
}
