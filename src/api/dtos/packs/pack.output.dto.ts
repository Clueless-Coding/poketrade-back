import { AutoMap } from "@automapper/classes";
import { ApiProperty } from "@nestjs/swagger";
import { UUIDv4 } from "src/common/types";
import { PokemonOutputDTO } from "../pokemons/pokemon.output.dto";

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

  @ApiProperty({ type: PokemonOutputDTO, isArray: true })
  @AutoMap(() => [PokemonOutputDTO])
  public readonly pokemons: PokemonOutputDTO[];
}
