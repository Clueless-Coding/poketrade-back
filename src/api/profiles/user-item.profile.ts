import { createMap, Mapper, MappingProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { UserItemOutputDTO } from '../dtos/user-items/user-item.output.dto';
import { QuickSoldItemOutputDTO } from '../dtos/user-items/quick-sold-item.output.dto';
import { UserItemEntity } from 'src/core/entities/user-item.entity';
import { QuickSoldItemEntity } from 'src/core/entities/quick-sold-item.entity';

@Injectable()
export class UserItemProfile extends AutomapperProfile {
  public constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  public override get profile(): MappingProfile {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        UserItemEntity,
        UserItemOutputDTO,
      );
      createMap(
        mapper,
        QuickSoldItemEntity,
        QuickSoldItemOutputDTO,
      );
    };
  }
}
