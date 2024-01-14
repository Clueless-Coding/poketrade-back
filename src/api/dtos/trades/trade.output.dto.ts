import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { UUIDv4 } from 'src/common/types';
import { TradeStatus } from 'src/infra/postgres/entities/trade.entity';
import { UserInventoryEntryOutputDTO } from '../user-inventory-entries/user-inventory-entry.output.dto';
import { UserOutputDTO } from '../users/user.output.dto';

export class TradeOutputDTO {
  @ApiProperty()
  @AutoMap()
  public readonly id: UUIDv4;

  @ApiProperty()
  @AutoMap()
  public readonly createdAt: Date;

  @ApiProperty()
  @AutoMap()
  public readonly updatedAt: Date;

  @ApiProperty()
  @AutoMap()
  public readonly status: TradeStatus;

  @ApiProperty({ type: UserOutputDTO })
  @AutoMap(() => UserOutputDTO)
  public readonly sender: UserOutputDTO;

  @ApiProperty({ type: UserInventoryEntryOutputDTO, isArray: true })
  @AutoMap(() => [UserInventoryEntryOutputDTO])
  public readonly senderInventoryEntries: Array<UserInventoryEntryOutputDTO>;

  @ApiProperty({ type: UserOutputDTO })
  @AutoMap(() => UserOutputDTO)
  public readonly receiver: UserOutputDTO;

  @ApiProperty({ type: UserInventoryEntryOutputDTO, isArray: true })
  @AutoMap(() => [UserInventoryEntryOutputDTO])
  public readonly receiverInventoryEntries: Array<UserInventoryEntryOutputDTO>;
}
