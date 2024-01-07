import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { UserInventoryEntryEntity } from 'src/infra/postgres/entities/user-inventory-entry.entity';
import { UserInventoryEntryOutputDTO } from '../dtos/user-inventory-entries/user-inventory-entry.output.dto';
import { QuickSoldUserInventoryEntryEntity } from 'src/infra/postgres/entities/quick-sold-user-inventory-entry.entity';
import { QuickSoldUserInventoryEntryOutputDTO } from '../dtos/user-inventory-entries/quick-sold-user-inventory-entry.output.dto';

@Injectable()
export class UserInventoryEntryProfile extends AutomapperProfile {
  public constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  public override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, UserInventoryEntryEntity, UserInventoryEntryOutputDTO);
      createMap(mapper, QuickSoldUserInventoryEntryEntity, QuickSoldUserInventoryEntryOutputDTO);
    };
  }
}
