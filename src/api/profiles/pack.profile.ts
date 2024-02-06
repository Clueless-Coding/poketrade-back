import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Mapper, createMap, forSelf } from '@automapper/core';
import { PackOutputDTO } from '../dtos/packs/pack.output.dto';
import { OpenedPackOutputDTO } from '../dtos/packs/opened-pack.output.dto';
import { OpenedPackEntity} from 'src/core/entities/opened-pack.entity';
import { PackEntity } from 'src/core/entities/pack.entity';
import { PackToPokemonEntity } from 'src/core/entities/pack-to-pokemon.entity';
import { PokemonOutputDTO } from '../dtos/pokemons/pokemon.output.dto';

@Injectable()
export class PackProfile extends AutomapperProfile {
  public constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  public override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        PackEntity,
        PackOutputDTO,
      );
      createMap(
        mapper,
        OpenedPackEntity,
        OpenedPackOutputDTO,
      );
      createMap(
        mapper,
        PackToPokemonEntity,
        PokemonOutputDTO,
        forSelf(PokemonOutputDTO, (source) => source.pokemon)
      );
    };
  }
}
