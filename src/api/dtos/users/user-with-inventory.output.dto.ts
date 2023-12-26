import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { UserInventoryEntryOutputDTO } from './user-inventory-entry.output.dto';
import { UserOutputDTO } from './user.output.dto';

export class UserWithInventoryOutputDTO extends UserOutputDTO {
  @ApiProperty({ type: UserInventoryEntryOutputDTO, isArray: true })
  @AutoMap(() => [UserInventoryEntryOutputDTO])
  public readonly inventory: Array<UserInventoryEntryOutputDTO>;
}
