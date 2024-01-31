import { ApiProperty } from '@nestjs/swagger';
import { JWT } from 'src/common/types';

export class GenerateCentrifugoSubscriptionTokenOutputDTO {
  @ApiProperty()
  subscriptionToken: JWT;
}
