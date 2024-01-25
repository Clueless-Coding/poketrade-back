import { ApiProperty } from '@nestjs/swagger';
import { PokemonOutputDTO } from '../pokemons/pokemon.output.dto';
import { UserOutputDTO } from '../users/user.output.dto';

export class OpenPackOutputDTO {
  @ApiProperty({ type: UserOutputDTO })
  public readonly user: UserOutputDTO;

  @ApiProperty({ type: PokemonOutputDTO })
  public readonly pokemon: PokemonOutputDTO;

  @ApiProperty()
  public readonly isDuplicate: boolean;
}
