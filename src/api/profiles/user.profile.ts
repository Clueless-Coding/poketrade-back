import { AutomapperProfile } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { Mapper, createMap } from '@automapper/core';
import { UserEntity } from 'src/infra/postgres/entities/user.entity';
import { UserOutputDTO } from '../dtos/users/user.output.dto';

@Injectable()
export class UserProfile extends AutomapperProfile {
  // TODO: Try to use InjectMapper instead. For some reason it doesn't work
  public constructor(@Inject('automapper:nestjs:default') mapper: Mapper) {
    super(mapper);
  }

  public override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, UserEntity, UserOutputDTO);
    };
  }
}
