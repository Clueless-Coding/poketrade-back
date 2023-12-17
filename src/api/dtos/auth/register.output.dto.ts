import { ApiProperty } from '@nestjs/swagger';
import { JWT } from 'src/common/types';

export class RegisterOutputDTO {
  @ApiProperty()
  public readonly accessToken: JWT;
}
