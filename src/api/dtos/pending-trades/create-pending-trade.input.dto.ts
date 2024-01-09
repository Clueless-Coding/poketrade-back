import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsUUID } from "class-validator";
import { UUIDv4 } from "src/common/types";

export class CreatePendingTradeInputDTO {
  @ApiProperty()
  @IsUUID(4, { each: true })
  @ArrayNotEmpty()
  senderInventoryEntryIds: Array<UUIDv4>;

  @ApiProperty()
  @IsUUID(4)
  receiverId: UUIDv4;

  @ApiProperty()
  @IsUUID(4, { each: true })
  @ArrayNotEmpty()
  receiverInventoryEntryIds: Array<UUIDv4>;
}
