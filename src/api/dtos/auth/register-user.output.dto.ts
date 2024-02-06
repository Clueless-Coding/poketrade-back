import { ApiProperty } from '@nestjs/swagger';
import { JWT } from 'src/common/types';
import { UserOutputDTO } from '../users/user.output.dto';
import { ApiPropertyJWT } from 'src/api/decorators/api-property-jwt.decorator';

export class RegisterUserOutputDTO {
  @ApiProperty({ type: UserOutputDTO })
  public readonly user: UserOutputDTO;

  @ApiPropertyJWT()
  public readonly accessToken: JWT;

  @ApiPropertyJWT()
  public readonly refreshToken: JWT;
}
