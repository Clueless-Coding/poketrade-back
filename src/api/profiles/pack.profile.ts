import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Mapper, createMap } from '@automapper/core';
import { PackOutputDTO } from '../dtos/packs/pack.output.dto';
import { OpenedPackOutputDTO } from '../dtos/packs/opened-pack.output.dto';
import { OpenedPackEntity} from 'src/core/entities/opened-pack.entity';
import { PackEntity } from 'src/core/entities/pack.entity';

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
    };
  }
}
