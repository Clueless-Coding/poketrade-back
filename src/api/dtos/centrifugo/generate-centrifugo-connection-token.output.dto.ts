import { ApiPropertyJWT } from 'src/api/decorators/api-property-jwt.decorator';
import { JWT } from 'src/common/types';

export class GenerateCentrifugoConnectionTokenOutputDTO {
  @ApiPropertyJWT()
  connectionToken: JWT;
}
