import { ApiProperty } from '@nestjs/swagger';
import { UUIDv4 } from 'src/common/types';
import { TradeStatus } from 'src/core/entities/trade.entity';
import { UserOutputDTO } from '../users/user.output.dto';
import { AutoMap } from '@automapper/classes';

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

  @ApiProperty()
  @AutoMap()
  public readonly statusedAt: Date;

  @ApiProperty({ type: UserOutputDTO })
  @AutoMap(() => UserOutputDTO)
  public readonly sender: UserOutputDTO;

  @ApiProperty({ type: UserOutputDTO })
  @AutoMap(() => UserOutputDTO)
  public readonly receiver: UserOutputDTO;
}
