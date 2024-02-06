import { ApiPropertyJWT } from 'src/api/decorators/api-property-jwt.decorator';
import { JWT } from 'src/common/types';

export class GenerateCentrifugoSubscriptionTokenOutputDTO {
  @ApiPropertyJWT()
  subscriptionToken: JWT;
}
