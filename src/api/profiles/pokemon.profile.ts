import { Mapper, createMap } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { PokemonEntity } from 'src/infra/postgres/entities/pokemon.entity';
import { PokemonOutputDTO } from '../dtos/pokemons/pokemon.output.dto';

@Injectable()
export class PokemonProfile extends AutomapperProfile {
  public constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  public override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, PokemonEntity, PokemonOutputDTO);
    };
  }
}
