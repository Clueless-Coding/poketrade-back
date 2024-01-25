import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Mapper, createMap } from '@automapper/core';
import { PackOutputDTO } from '../dtos/packs/pack.output.dto';
import { PackWithPokemonsOutputDTO } from '../dtos/packs/pack-with-pokemons.output.dto';
import { OpenedPackOutputDTO } from '../dtos/packs/opened-pack.output.dto';
import { PojosMetadataMap } from '@automapper/pojos';
import { OpenedPackEntity, PackEntity, PackToPokemonEntity } from 'src/infra/postgres/tables';

@Injectable()
export class PackProfile extends AutomapperProfile {
  public constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
    this.createMetadataEntities();
    this.createMetadataDTOs();
  }

  public override get profile() {
    return (mapper: Mapper) => {
      createMap<PackEntity, PackOutputDTO>(
        mapper,
        'PackEntity',
        'PackOutputDTO',
      );
      createMap<OpenedPackEntity, OpenedPackOutputDTO>(
        mapper,
        'OpenedPackEntity',
        'OpenedPackOutputDTO',
      );
    };
  }

  private createMetadataEntities(): void {
    PojosMetadataMap.create<PackToPokemonEntity>('PackToPokemonEntity', {
      pack: 'PackEntity',
      pokemon: 'PokemonEntity',
    });

    PojosMetadataMap.create<PackEntity>('PackEntity', {
      id: String,
      name: String,
      description: String,
      price: String,
      image: String,
    });

    PojosMetadataMap.create<OpenedPackEntity>('OpenedPackEntity', {
      id: String,
      openedAt: Date,
      user: 'UserEntity',
      pack: 'PackEntity',
      pokemon: 'PokemonEntity',
    });
  }

  private createMetadataDTOs(): void {
    const packOutputDTOProperties = {
      id: String,
      name: String,
      description: String,
      price: String,
      image: String,
    }

    PojosMetadataMap.create<PackOutputDTO>('PackOutputDTO', packOutputDTOProperties);
    PojosMetadataMap.create<PackWithPokemonsOutputDTO>('PackWithPokemonsOutputDTO', {
      ...packOutputDTOProperties,
      pokemons: ['PokemonOutputDTO'],
    });

    PojosMetadataMap.create<OpenedPackOutputDTO>('OpenedPackOutputDTO', {
      id: String,
      openedAt: Date,
      user: 'UserOutputDTO',
      pack: 'PackOutputDTO',
      pokemon: 'PokemonOutputDTO',
    });
  }
}
