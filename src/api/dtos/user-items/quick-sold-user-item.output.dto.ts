import { ApiProperty } from '@nestjs/swagger';
import { UserItemOutputDTO } from './user-item.output.dto';
import { AutoMap } from '@automapper/classes';

export class QuickSoldUserItemOutputDTO extends UserItemOutputDTO {
  @ApiProperty()
  @AutoMap()
  public readonly soldAt: Date;
}
