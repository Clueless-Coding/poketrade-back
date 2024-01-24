import { ApiProperty } from '@nestjs/swagger';

export class PokemonOutputDTO {
  @ApiProperty()
  public readonly id: number;

  @ApiProperty()
  public readonly name: string;

  @ApiProperty()
  public readonly worth: number;

  @ApiProperty()
  public readonly height: number;

  @ApiProperty()
  public readonly weight: number;

  @ApiProperty()
  public readonly image: string;
}
