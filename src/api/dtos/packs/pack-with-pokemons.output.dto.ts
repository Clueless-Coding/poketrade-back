import { ApiProperty } from '@nestjs/swagger';
import { PokemonOutputDTO } from '../pokemons/pokemon.output.dto';
import { PackOutputDTO } from './pack.output.dto';

export class PackWithPokemonsOutputDTO extends PackOutputDTO {
  @ApiProperty({ type: PokemonOutputDTO, isArray: true })
  public readonly pokemons: Array<PokemonOutputDTO>;
}
