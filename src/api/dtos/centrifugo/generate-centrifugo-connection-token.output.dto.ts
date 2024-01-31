import { ApiProperty } from '@nestjs/swagger';
import { JWT } from 'src/common/types';

export class GenerateCentrifugoConnectionTokenOutputDTO {
  @ApiProperty()
  connectionToken: JWT;
}
