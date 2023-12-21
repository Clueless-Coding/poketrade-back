import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { PokemonOutputDTO } from '../pokemons/pokemon.output.dto';
import { UserOutputDTO } from './user.output.dto';

export class UserWithPokemonsOutputDTO extends UserOutputDTO {
  @ApiProperty({ type: PokemonOutputDTO, isArray: true })
  @AutoMap(() => [PokemonOutputDTO])
  public readonly pokemons: PokemonOutputDTO[];
}
