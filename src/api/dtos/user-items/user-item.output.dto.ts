import { ApiProperty } from '@nestjs/swagger';
import { UUIDv4 } from 'src/common/types';
import { PokemonOutputDTO } from '../pokemons/pokemon.output.dto';

export class UserItemOutputDTO {
  @ApiProperty()
  public readonly id: UUIDv4;

  @ApiProperty()
  public readonly receivedAt: Date;

  @ApiProperty({ type: PokemonOutputDTO })
  public readonly pokemon: PokemonOutputDTO;
}
