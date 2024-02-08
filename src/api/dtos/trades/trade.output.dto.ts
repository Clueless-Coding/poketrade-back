import { ApiProperty } from '@nestjs/swagger';
import { UUIDv4 } from 'src/common/types';
import { TradeStatus } from 'src/core/enums/trade-status.enum';
import { UserOutputDTO } from '../users/user.output.dto';
import { AutoMap } from '@automapper/classes';
import { ApiPropertyUUIDv4 } from 'src/api/decorators/api-property-uuid-v4.decorator';

export class TradeOutputDTO {
  @ApiPropertyUUIDv4()
  @AutoMap()
  public readonly id: UUIDv4;

  @ApiProperty()
  @AutoMap()
  public readonly createdAt: Date;

  @ApiProperty()
  @AutoMap()
  public readonly updatedAt: Date;

  @ApiProperty({ enum: TradeStatus })
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
