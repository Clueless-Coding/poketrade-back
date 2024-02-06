import { UUIDv4 } from 'src/common/types';
import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { ApiPropertyUUIDv4 } from 'src/api/decorators/api-property-uuid-v4.decorator';

export class UserOutputDTO {
  @ApiPropertyUUIDv4()
  @AutoMap()
  public readonly id: UUIDv4;

  @ApiProperty()
  @AutoMap()
  public readonly name: string;

  @ApiProperty()
  @AutoMap()
  public readonly balance: number;
}
