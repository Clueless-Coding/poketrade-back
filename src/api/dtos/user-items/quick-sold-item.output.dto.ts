import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';

export class QuickSoldItemOutputDTO {
  @ApiProperty()
  @AutoMap()
  public readonly soldAt: Date;
}
