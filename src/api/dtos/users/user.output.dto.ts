import { UUIDv4 } from 'src/common/types';
import { ApiProperty } from '@nestjs/swagger';

export class UserOutputDTO {
  @ApiProperty()
  public readonly id: UUIDv4;

  @ApiProperty()
  public readonly name: string;

  @ApiProperty()
  public readonly balance: number;
}
