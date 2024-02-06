import { IsUUID } from "class-validator";
import { ApiPropertyUUIDv4 } from "src/api/decorators/api-property-uuid-v4.decorator";
import { UUIDv4 } from "src/common/types";

export class CreatePendingTradeInputDTO {
  @ApiPropertyUUIDv4({ isArray: true })
  @IsUUID(4, { each: true })
  senderItemIds: Array<UUIDv4>;

  @ApiPropertyUUIDv4()
  @IsUUID(4)
  receiverId: UUIDv4;

  @ApiPropertyUUIDv4({ isArray: true })
  @IsUUID(4, { each: true })
  receiverItemIds: Array<UUIDv4>;
}
