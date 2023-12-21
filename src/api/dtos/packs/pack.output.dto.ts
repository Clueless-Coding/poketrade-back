import { AutoMap } from "@automapper/classes";
import { ApiProperty } from "@nestjs/swagger";
import { UUIDv4 } from "src/common/types";

export class PackOutputDTO {
  @ApiProperty()
  @AutoMap()
  public readonly id: UUIDv4;

  @ApiProperty()
  @AutoMap()
  public readonly name: string;

  @ApiProperty()
  @AutoMap()
  public readonly description: string;

  @ApiProperty()
  @AutoMap()
  public readonly price: number;

  // NOTE: URL
  @ApiProperty()
  @AutoMap()
  public readonly image: string;
}
