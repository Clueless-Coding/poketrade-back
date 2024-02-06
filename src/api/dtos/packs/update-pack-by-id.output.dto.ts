import { AutoMap } from "@automapper/classes";
import { PackOutputDTO } from "./pack.output.dto";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PokemonOutputDTO } from "../pokemons/pokemon.output.dto";

export class UpdatePackByIdOutputDTO {
  @ApiProperty({ type: PackOutputDTO })
  @AutoMap(() => [PackOutputDTO])
  public readonly pack: PackOutputDTO;

  @ApiPropertyOptional({ type: PokemonOutputDTO, isArray: true })
  @AutoMap(() => [PokemonOutputDTO])
  public readonly pokemons?: Array<PokemonOutputDTO>;
}
