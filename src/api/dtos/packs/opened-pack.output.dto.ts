import { ApiProperty } from '@nestjs/swagger';
import { UUIDv4 } from 'src/common/types';
import { PokemonOutputDTO } from '../pokemons/pokemon.output.dto';
import { UserOutputDTO } from '../users/user.output.dto';
import { PackOutputDTO } from './pack.output.dto';

export class OpenedPackOutputDTO {
  @ApiProperty()
  public readonly id: UUIDv4;

  @ApiProperty()
  public readonly openedAt: Date;

  @ApiProperty({ type: UserOutputDTO })
  public readonly user: UserOutputDTO;

  @ApiProperty({ type: PackOutputDTO })
  public readonly pack: PackOutputDTO;

  @ApiProperty({ type: PokemonOutputDTO })
  public readonly pokemon: PokemonOutputDTO;
}
