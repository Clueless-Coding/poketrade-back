import { PendingTradeOutputDTO } from './pending-trade.output.dto';
import { AutoMap } from '@automapper/classes';
import { UserItemOutputDTO } from '../user-items/user-item.output.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePendingTradeOutputDTO {
  @ApiProperty({ type: PendingTradeOutputDTO })
  @AutoMap(() => PendingTradeOutputDTO)
  public readonly pendingTrade: PendingTradeOutputDTO;

  @ApiProperty({ type: UserItemOutputDTO, isArray: true })
  @AutoMap(() => [UserItemOutputDTO])
  public readonly senderItems: Array<UserItemOutputDTO>;

  @ApiProperty({ type: UserItemOutputDTO, isArray: true })
  @AutoMap(() => [UserItemOutputDTO])
  public readonly receiverItems: Array<UserItemOutputDTO>;
}
