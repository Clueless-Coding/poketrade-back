import { AutoMap } from "@automapper/classes";
import { ApiPropertyUUIDv4 } from "src/api/decorators/api-property-uuid-v4.decorator";
import { UUIDv4 } from "src/common/types";
import { PokemonOutputDTO } from "../pokemons/pokemon.output.dto";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserOutputDTO } from "../users/user.output.dto";

export class ItemOutputDTO {
  @ApiPropertyUUIDv4()
  @AutoMap()
  public readonly id: UUIDv4;

  @ApiProperty()
  @AutoMap()
  public readonly createdAt: Date;

  @ApiProperty({ type: PokemonOutputDTO })
  @AutoMap(() => PokemonOutputDTO)
  public readonly pokemon: PokemonOutputDTO;

  @ApiPropertyOptional({ type: UserOutputDTO })
  @AutoMap(() => UserOutputDTO)
  public readonly owner?: UserOutputDTO;
}
