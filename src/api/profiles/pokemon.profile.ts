import { Mapper, createMap, MappingProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { PojosMetadataMap } from '@automapper/pojos';
import { Injectable } from '@nestjs/common';
import { PokemonOutputDTO } from '../dtos/pokemons/pokemon.output.dto';
import { PokemonEntity } from 'src/infra/postgres/tables';

@Injectable()
export class PokemonProfile extends AutomapperProfile {
  public constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
    this.createMetadataEntities();
    this.createMetadataDTOs();
  }

  public override get profile(): MappingProfile {
    return (mapper: Mapper) => {
      createMap<PokemonEntity, PokemonOutputDTO>(
        mapper,
        'PokemonEntity',
        'PokemonOutputDTO',
      );
    };
  }

  private createMetadataEntities(): void {
    PojosMetadataMap.create<PokemonEntity>('PokemonEntity', {
      id: Number,
      name: String,
      worth: Number,
      height: Number,
      weight: Number,
      image: String,
    });
  }

  private createMetadataDTOs(): void {
    PojosMetadataMap.create<PokemonOutputDTO>('PokemonOutputDTO', {
      id: Number,
      name: String,
      worth: Number,
      height: Number,
      weight: Number,
      image: String,
    });
  }
}
