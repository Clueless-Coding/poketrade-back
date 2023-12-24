import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Mapper, createMap } from '@automapper/core';
import { PackEntity } from 'src/infra/postgres/entities/pack.entity';
import { PackOutputDTO } from '../dtos/packs/pack.output.dto';
import { PackWithPokemonsOutputDTO } from '../dtos/packs/pack-with-pokemons.output.dto';

@Injectable()
export class PackProfile extends AutomapperProfile {
  public constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  public override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, PackEntity, PackOutputDTO);
      createMap(mapper, PackEntity, PackWithPokemonsOutputDTO);
    };
  }
}
