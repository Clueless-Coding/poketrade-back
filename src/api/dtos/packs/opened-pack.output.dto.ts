import { ApiProperty } from '@nestjs/swagger';
import { UUIDv4 } from 'src/common/types';
import { PokemonOutputDTO } from '../pokemons/pokemon.output.dto';
import { UserOutputDTO } from '../users/user.output.dto';
import { PackOutputDTO } from './pack.output.dto';
import { AutoMap } from '@automapper/classes';

export class OpenedPackOutputDTO {
  @ApiProperty()
  @AutoMap()
  public readonly id: UUIDv4;

  @ApiProperty()
  @AutoMap()
  public readonly openedAt: Date;

  @ApiProperty({ type: UserOutputDTO })
  @AutoMap(() => UserOutputDTO)
  public readonly user: UserOutputDTO;

  @ApiProperty({ type: PackOutputDTO })
  @AutoMap(() => PackOutputDTO)
  public readonly pack: PackOutputDTO;

  @ApiProperty({ type: PokemonOutputDTO })
  @AutoMap(() => PokemonOutputDTO)
  public readonly pokemon: PokemonOutputDTO;
}
