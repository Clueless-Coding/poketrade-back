import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { UserInventoryEntryOutputDTO } from '../user-inventory-entries/user-inventory-entry.output.dto';
import { UserOutputDTO } from './user.output.dto';

export class UserWithInventoryEntriesOutputDTO extends UserOutputDTO {
  @ApiProperty({ type: UserInventoryEntryOutputDTO, isArray: true })
  @AutoMap(() => [UserInventoryEntryOutputDTO])
  public readonly inventoryEntries: Array<UserInventoryEntryOutputDTO>;
}
