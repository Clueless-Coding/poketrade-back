import { ApiProperty } from "@nestjs/swagger";
import { UUIDv4 } from "src/common/types";

export class PackOutputDTO {
  @ApiProperty()
  public readonly id: UUIDv4;

  @ApiProperty()
  public readonly name: string;

  @ApiProperty()
  public readonly description: string;

  @ApiProperty()
  public readonly price: number;

  // NOTE: URL
  @ApiProperty()
  public readonly image: string;
}
