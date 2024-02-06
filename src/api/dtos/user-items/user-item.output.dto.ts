import { ApiProperty } from '@nestjs/swagger';
import { UUIDv4 } from 'src/common/types';
import { PokemonOutputDTO } from '../pokemons/pokemon.output.dto';
import { AutoMap } from '@automapper/classes';
import { ApiPropertyUUIDv4 } from 'src/api/decorators/api-property-uuid-v4.decorator';

export class UserItemOutputDTO {
  @ApiPropertyUUIDv4()
  @AutoMap()
  public readonly id: UUIDv4;

  @ApiProperty()
  @AutoMap()
  public readonly receivedAt: Date;

  @ApiProperty({ type: PokemonOutputDTO })
  @AutoMap(() => PokemonOutputDTO)
  public readonly pokemon: PokemonOutputDTO;
}
