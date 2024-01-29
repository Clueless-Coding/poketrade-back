import { ApiProperty } from '@nestjs/swagger';
import { JWT } from 'src/common/types';
import { UserOutputDTO } from '../users/user.output.dto';

export class RegisterUserOutputDTO {
  @ApiProperty({ type: UserOutputDTO })
  public readonly user: UserOutputDTO;

  @ApiProperty()
  public readonly accessToken: JWT;
}
