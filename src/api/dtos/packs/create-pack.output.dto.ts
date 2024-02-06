import { AutoMap } from "@automapper/classes";
import { PackOutputDTO } from "./pack.output.dto";
import { ApiProperty } from "@nestjs/swagger";
import { PokemonOutputDTO } from "../pokemons/pokemon.output.dto";

export class CreatePackOutputDTO {
  @ApiProperty({ type: PackOutputDTO })
  @AutoMap(() => [PackOutputDTO])
  public readonly pack: PackOutputDTO;

  @ApiProperty({ type: PokemonOutputDTO, isArray: true })
  @AutoMap(() => [PokemonOutputDTO])
  public readonly pokemons: Array<PokemonOutputDTO>;
}

