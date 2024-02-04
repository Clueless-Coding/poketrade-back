import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Mapper, createMap, MappingProfile } from '@automapper/core';
import { UserOutputDTO } from '../dtos/users/user.output.dto';
import { UserEntity } from 'src/core/entities/user.entity';

@Injectable()
export class UserProfile extends AutomapperProfile {
  public constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  public override get profile(): MappingProfile {
    return (mapper: Mapper) => {
      createMap(mapper, UserEntity, UserOutputDTO);
    };
  }
}
