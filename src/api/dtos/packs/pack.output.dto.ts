import { AutoMap } from "@automapper/classes";
import { ApiProperty } from "@nestjs/swagger";
import { ApiPropertyUUIDv4 } from "src/api/decorators/api-property-uuid-v4.decorator";
import { UUIDv4 } from "src/common/types";

export class PackOutputDTO {
  @ApiPropertyUUIDv4()
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

  @ApiProperty({ format: 'uri' })
  @AutoMap()
  public readonly image: string;
}
