import { createMap, Mapper, MappingProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { UserItemOutputDTO } from '../dtos/user-items/user-item.output.dto';
import { QuickSoldUserItemOutputDTO } from '../dtos/user-items/quick-sold-user-item.output.dto';
import { PojosMetadataMap } from '@automapper/pojos';
import { QuickSoldUserItemEntity, UserItemEntity } from 'src/infra/postgres/tables';

@Injectable()
export class UserItemProfile extends AutomapperProfile {
  public constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
    this.createMetadataEntities();
    this.createMetadataDTOs();
  }

  public override get profile(): MappingProfile {
    return (mapper: Mapper) => {
      createMap<UserItemEntity, UserItemOutputDTO>(
        mapper,
        'UserItemEntity',
        'UserItemOutputDTO',
      );
      createMap<QuickSoldUserItemEntity, QuickSoldUserItemOutputDTO>(
        mapper,
        'QuickSoldUserItemEntity',
        'QuickSoldUserItemOutputDTO',
      );
    };
  }

  private createMetadataEntities(): void {
    const userItemEntityProperties = {
      id: String,
      receivedAt: Date,
      user: 'UserEntity',
      pokemon: 'PokemonEntity',
    };

    PojosMetadataMap.create<UserItemEntity>('UserItemEntity', userItemEntityProperties);
    PojosMetadataMap.create<QuickSoldUserItemEntity>('QuickSoldUserItemEntity', {
      ...userItemEntityProperties,
      soldAt: Date,
    });
  }

  private createMetadataDTOs(): void {
    const userItemOutputDTOProperties = {
      id: String,
      receivedAt: Date,
      pokemon: 'PokemonOutputDTO',
    };

    PojosMetadataMap.create<UserItemOutputDTO>('UserItemOutputDTO', userItemOutputDTOProperties);
    PojosMetadataMap.create<QuickSoldUserItemOutputDTO>('QuickSoldUserItemOutputDTO', {
      ...userItemOutputDTOProperties,
      soldAt: Date,
    })
  }
}
