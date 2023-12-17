import { ApiProperty } from "@nestjs/swagger";
import { JWT } from "src/common/types";

export class LoginOutputDTO {
  @ApiProperty()
  public readonly accessToken: JWT;
}
