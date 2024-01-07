import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Mapper, createMap } from '@automapper/core';
import { UserEntity } from 'src/infra/postgres/entities/user.entity';
import { UserOutputDTO } from '../dtos/users/user.output.dto';
import { UserWithInventoryEntriesOutputDTO } from '../dtos/users/user-with-inventory-entries.output.dto';

@Injectable()
export class UserProfile extends AutomapperProfile {
  public constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  public override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, UserEntity, UserOutputDTO);
      createMap(mapper, UserEntity, UserWithInventoryEntriesOutputDTO);
    };
  }
}
