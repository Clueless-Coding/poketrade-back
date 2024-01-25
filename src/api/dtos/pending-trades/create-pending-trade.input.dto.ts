import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";
import { UUIDv4 } from "src/common/types";

export class CreatePendingTradeInputDTO {
  @ApiProperty()
  @IsUUID(4, { each: true })
  senderItemIds: Array<UUIDv4>;

  @ApiProperty()
  @IsUUID(4)
  receiverId: UUIDv4;

  @ApiProperty()
  @IsUUID(4, { each: true })
  receiverItemIds: Array<UUIDv4>;
}
