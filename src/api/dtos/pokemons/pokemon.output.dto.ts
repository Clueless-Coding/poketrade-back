import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';

export class PokemonOutputDTO {
  @ApiProperty()
  @AutoMap()
  public readonly id: number;

  @ApiProperty()
  @AutoMap()
  public readonly name: string;

  @ApiProperty()
  @AutoMap()
  public readonly worth: number;

  @ApiProperty()
  @AutoMap()
  public readonly height: number;

  @ApiProperty()
  @AutoMap()
  public readonly weight: number;

  @ApiProperty({ format: 'uri' })
  @AutoMap()
  public readonly image: string;
}
