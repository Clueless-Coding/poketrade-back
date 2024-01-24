import { ApiProperty } from '@nestjs/swagger';
import { UserItemOutputDTO } from './user-item.output.dto';

export class QuickSoldUserItemOutputDTO extends UserItemOutputDTO {
  @ApiProperty()
  public readonly soldAt: Date;
}
