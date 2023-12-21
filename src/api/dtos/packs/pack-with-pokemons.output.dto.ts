import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { PokemonOutputDTO } from '../pokemons/pokemon.output.dto';
import { PackOutputDTO } from './pack.output.dto';

export class PackWithPokemonsOutputDTO extends PackOutputDTO {
  @ApiProperty({ type: PokemonOutputDTO, isArray: true })
  @AutoMap(() => [PokemonOutputDTO])
  public readonly pokemons: PokemonOutputDTO[];
}
