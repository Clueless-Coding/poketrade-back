import { ApiProperty } from '@nestjs/swagger';
import { UUIDv4 } from 'src/common/types';
import { TradeStatus } from 'src/infra/postgres/tables/trades.table';
import { UserOutputDTO } from '../users/user.output.dto';

export class TradeOutputDTO {
  @ApiProperty()
  public readonly id: UUIDv4;

  @ApiProperty()
  public readonly createdAt: Date;

  @ApiProperty()
  public readonly updatedAt: Date;

  @ApiProperty()
  public readonly status: TradeStatus;

  @ApiProperty()
  public readonly statusedAt: Date;

  @ApiProperty({ type: UserOutputDTO })
  public readonly sender: UserOutputDTO;

  @ApiProperty({ type: UserOutputDTO })
  public readonly receiver: UserOutputDTO;
}
