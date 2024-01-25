import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Mapper, createMap, MappingProfile } from '@automapper/core';
import { UserOutputDTO } from '../dtos/users/user.output.dto';
import { PojosMetadataMap } from '@automapper/pojos';
import { UserEntity } from 'src/infra/postgres/tables';

@Injectable()
export class UserProfile extends AutomapperProfile {
  public constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
    this.createMetadataEntities();
    this.createMetadataDTOs();
  }

  public override get profile(): MappingProfile {
    return (mapper: Mapper) => {
      createMap<UserEntity, UserOutputDTO>(
        mapper,
        'UserEntity',
        'UserOutputDTO',
      );
    };
  }

  private createMetadataEntities(): void {
    PojosMetadataMap.create<UserEntity>('UserEntity', {
      id: String,
      createdAt: Date,
      updatedAt: Date,
      name: String,
      balance: Number,
    });
  }

  private createMetadataDTOs(): void {
    PojosMetadataMap.create<UserOutputDTO>('UserOutputDTO', {
      id: String,
      name: String,
      balance: Number,
    });
  }
}
