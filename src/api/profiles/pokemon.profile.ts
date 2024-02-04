import { Mapper, createMap, MappingProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { PokemonOutputDTO } from '../dtos/pokemons/pokemon.output.dto';
import { PokemonEntity } from 'src/core/entities/pokemon.entity';

@Injectable()
export class PokemonProfile extends AutomapperProfile {
  public constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  public override get profile(): MappingProfile {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        PokemonEntity,
        PokemonOutputDTO,
      );
    };
  }
}
