import { Mapper, createMap } from '@automapper/core';
import { AutomapperProfile } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { PokemonEntity } from 'src/infra/postgres/entities/pokemon.entity';
import { PokemonOutputDTO } from '../dtos/pokemons/pokemon.output.dto';

@Injectable()
export class PokemonProfile extends AutomapperProfile {

  // TODO: Try to use InjectMapper instead. For some reason it doesn't work
  public constructor(@Inject('automapper:nestjs:default') mapper: Mapper) {
    super(mapper);
  }

  public override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, PokemonEntity, PokemonOutputDTO);
    };
  }
}
