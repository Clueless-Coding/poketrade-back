import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { UUIDv4 } from 'src/common/types';
import { PokemonOutputDTO } from '../pokemons/pokemon.output.dto';
import { UserOutputDTO } from '../users/user.output.dto';

export class QuickSoldUserInventoryEntryOutputDTO {
  @ApiProperty()
  @AutoMap()
  public readonly id: UUIDv4;

  @ApiProperty()
  @AutoMap()
  public readonly soldAt: Date;

  @ApiProperty()
  @AutoMap()
  public readonly receivedAt: Date;

  @ApiProperty({ type: UserOutputDTO })
  @AutoMap(() => UserOutputDTO)
  public readonly user: UserOutputDTO;

  @ApiProperty({ type: PokemonOutputDTO })
  @AutoMap(() => PokemonOutputDTO)
  public readonly pokemon: PokemonOutputDTO;
}
